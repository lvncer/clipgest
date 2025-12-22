package service

import (
	"bytes"
	"context"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Metadata struct {
	Title       string
	Description string
	Image       string
	Source      string
}

// FetchMetadata scrapes the URL to find OGP title, description, and image.
func FetchMetadata(targetURL string) (*Metadata, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	meta, status, err := fetchAndParse(ctx, client, targetURL)
	if err != nil {
		return nil, err
	}
	// If direct fetch likely hit bot protection (or no useful tags), try a proxy fetch.
	//
	// Note: Some sites behind Cloudflare may return "Just a moment..." pages to cloud IPs
	// (even with a browser UA), resulting in empty OG tags.
	if status != 200 || looksLikeBotChallenge(meta.Title) || (meta.Image == "" && meta.Title == "" && meta.Description == "") {
		jinaURL := "https://r.jina.ai/" + targetURL
		fb, _, fbErr := fetchAndParse(ctx, client, jinaURL)
		if fbErr != nil {
			log.Printf("failed to fetch metadata via jina proxy: %v (target=%s)", fbErr, targetURL)
			return meta, nil
		}
		merged := mergePreferExisting(meta, fb)
		merged.Source = "jina"
		return merged, nil
	}

	meta.Source = "direct"
	return meta, nil
}

func looksLikeBotChallenge(title string) bool {
	t := strings.ToLower(strings.TrimSpace(title))
	return strings.Contains(t, "just a moment") || strings.Contains(t, "attention required") || strings.Contains(t, "cloudflare")
}

func mergePreferExisting(primary, fallback *Metadata) *Metadata {
	out := &Metadata{
		Title:       primary.Title,
		Description: primary.Description,
		Image:       primary.Image,
		Source:      primary.Source,
	}
	if out.Title == "" {
		out.Title = fallback.Title
	}
	if out.Description == "" {
		out.Description = fallback.Description
	}
	if out.Image == "" {
		out.Image = fallback.Image
	}
	return out
}

func fetchAndParse(ctx context.Context, client *http.Client, target string) (*Metadata, int, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", target, nil)
	if err != nil {
		return nil, 0, err
	}
	applyBrowserHeaders(req)

	res, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 2<<20)) // 2MB cap
	if err != nil {
		return nil, res.StatusCode, err
	}

	m := &Metadata{}

	// Try HTML OG tags first.
	if doc, err := goquery.NewDocumentFromReader(bytes.NewReader(body)); err == nil {
		// Helpers: sites sometimes use `property` or `name`.
		getMeta := func(key string) string {
			keyEsc := strings.ReplaceAll(key, "'", "\\'")
			if v := strings.TrimSpace(doc.Find("meta[property='"+keyEsc+"']").AttrOr("content", "")); v != "" {
				return v
			}
			if v := strings.TrimSpace(doc.Find("meta[name='"+keyEsc+"']").AttrOr("content", "")); v != "" {
				return v
			}
			return ""
		}

		// Title
		m.Title = firstNonEmpty(
			getMeta("og:title"),
			getMeta("twitter:title"),
			strings.TrimSpace(doc.Find("title").Text()),
		)
		// Description
		m.Description = firstNonEmpty(
			getMeta("og:description"),
			getMeta("twitter:description"),
			getMeta("description"),
		)
		// Image
		m.Image = firstNonEmpty(
			getMeta("og:image"),
			getMeta("og:image:url"),
			getMeta("twitter:image"),
			getMeta("twitter:image:src"),
		)

		// Resolve relative image URLs if any.
		if m.Image != "" {
			m.Image = resolveMaybeRelativeURL(target, m.Image)
		}
	}

	// If still missing image, try extracting from jina's Markdown/plain content.
	if m.Image == "" {
		text := string(body)
		m.Title = firstNonEmpty(m.Title, parseJinaTitle(text))
		m.Image = firstNonEmpty(m.Image, extractFirstImageURL(text))
	}

	return m, res.StatusCode, nil
}

func applyBrowserHeaders(req *http.Request) {
	// Some sites (e.g. behind Cloudflare) may block obvious bot UAs from cloud IPs.
	// Use a browser-like UA to improve fetch success rates.
	req.Header.Set(
		"User-Agent",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
	)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "ja,en-US;q=0.9,en;q=0.8")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Pragma", "no-cache")
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		v = strings.TrimSpace(v)
		if v != "" {
			return v
		}
	}
	return ""
}

func resolveMaybeRelativeURL(baseStr, u string) string {
	u = strings.TrimSpace(u)
	if u == "" {
		return ""
	}
	parsed, err := url.Parse(u)
	if err == nil && parsed.IsAbs() {
		return u
	}
	base, err := url.Parse(baseStr)
	if err != nil || base == nil {
		return u
	}
	if parsed == nil {
		parsed, _ = url.Parse(u)
	}
	if parsed == nil {
		return u
	}
	return base.ResolveReference(parsed).String()
}

func parseJinaTitle(text string) string {
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Title:") {
			return strings.TrimSpace(strings.TrimPrefix(line, "Title:"))
		}
	}
	return ""
}

var (
	reMarkdownImage = regexp.MustCompile(`!\[[^\]]*\]\((https?://[^)\s]+)\)`)
	reImageURL      = regexp.MustCompile(`https?://[^\s)]+?\.(?:png|jpe?g|webp)(?:\?[^\s)]*)?`)
)

func extractFirstImageURL(text string) string {
	if m := reMarkdownImage.FindStringSubmatch(text); len(m) == 2 {
		return strings.TrimRight(m[1], ")")
	}
	if m := reImageURL.FindString(text); m != "" {
		return strings.TrimRight(m, ")")
	}
	return ""
}
