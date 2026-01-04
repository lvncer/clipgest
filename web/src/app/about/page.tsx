import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WebHeader from "@/components/layouts/WebHeader";

export const metadata: Metadata = {
  title: "clipgest",
  description:
    "気になった記事を一瞬で保存し、後でまとめて読めるツール。ブラウザ拡張で簡単保存、Web でスッキリ閲覧。",
  openGraph: {
    title: "clipgest - リンク保存が秒で終わる",
    description: "気になった記事を一瞬で保存し、後でまとめて読めるツール。",
    images: ["/images/toppage.jpeg"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WebHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-start justify-start space-y-8 order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-left">
                Clip Links instantly and Make Digests with AI.
              </h1>
              <div className="flex flex-col items-start justify-start space-y-4">
                <div className="text-md text-muted-foreground text-left">
                  気になった Web ページの URL をブラウザ拡張から一瞬で保存し、
                  ダッシュボードで週次・月次ダイジェストにまとめる。
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="h-12 px-8 text-lg" asChild>
                    <Link href="/sign-up">
                      今すぐ始める <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="/images/toppage.jpeg"
                alt="clipgest"
                width={1000}
                height={1000}
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-4 max-w-6xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="space-y-6 flex-1">
              <h3 className="text-2xl font-bold">ブラウザ拡張で保存</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                ブラウジング中に気になったら、右クリックして「Save
                link」を選ぶだけ。
                ページ遷移も待ち時間もありません。あなたの集中力を途切れさせることなく、
                興味のある情報をストックできます。
              </p>
            </div>
            <div className="flex-1 relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border">
              <Image
                src="/images/extension.jpeg"
                alt="clipgest Extension Demo"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-bold">見やすく整理、すぐに探せる</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                保存したリンクは専用のダッシュボードで一覧表示。
                自動取得されたアイキャッチ画像やタイトルで、何の記事だったか一目で分かります。
                デバイスを問わず、どこからでもアクセス可能です。
              </p>
            </div>
            <div className="flex-1 relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border">
              <Image
                src="/images/toppage.jpeg"
                alt="clipgest Dashboard Demo"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-bold">
                AI ダイジェスト（Coming Soon）
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                週次・月次で保存した記事をAIが要約してダイジェストを作成。
                積読の消化を強力にサポートします。
              </p>
            </div>
            <div className="flex-1 relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border">
              <Image
                src="/images/toppage.jpeg"
                alt="clipgest Dashboard Demo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-16">3ステップで始める</h2>
            <div className="flex flex-col md:flex-row gap-6 relative">
              <div className="hidden md:block pointer-events-none absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />
              <div className="flex-1 space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                  1
                </div>
                <h3 className="text-xl font-bold">拡張機能を導入</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  <Link
                    href="https://chromewebstore.google.com/detail/quicklinks/jofhehfnmliefoipncjbimmomenmegmj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    Chrome ウェブストア
                  </Link>
                  から拡張機能をインストールします。
                </p>
              </div>

              <div className="flex-1 space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                  2
                </div>
                <h3 className="text-xl font-bold">Web で認証する</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  <Link
                    href="/"
                    className="mx-1 underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    こちら
                  </Link>
                  からサインインして認証を完了します。
                </p>
              </div>

              <div className="flex-1 space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                  3
                </div>
                <h3 className="text-xl font-bold">保存＆閲覧</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  気になったリンクを拡張機能からサッと保存。保存後は Web
                  の一覧画面から見返せます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 p-8 md:p-12 rounded-3xl bg-primary/5 border border-primary/10">
            <h2 className="text-3xl md:text-4xl font-bold">
              あなたの情報収集を、
              <br />
              もっと快適に。
            </h2>
            <p className="text-lg text-muted-foreground">
              clipgest で、積読を消化する新しい習慣を始めましょう。
              <br />
              完全無料で利用できます。
            </p>
            <Button
              size="lg"
              className="h-14 px-8 text-lg w-full sm:w-auto"
              asChild
            >
              <Link href="/sign-up">
                サインアップして使ってみる{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
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
            <Link
              href="/sign-in"
              className="hover:text-foreground transition-colors"
            >
              サインイン
            </Link>
            <a
              href="https://github.com/lvncer/quicklinks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
