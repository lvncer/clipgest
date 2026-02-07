import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-4 bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-lg font-bold">clipgest</span>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} clipgest. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            プライバシーポリシー
          </Link>
          <a
            href="https://github.com/lvncer/clipgest"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
