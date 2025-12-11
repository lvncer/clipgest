import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Bookmark, LayoutGrid, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "QuickLinks - リンク保存が秒で終わる",
  description:
    "気になった記事を一瞬で保存し、後でまとめて読めるツール。ブラウザ拡張で簡単保存、Web でスッキリ閲覧。",
  openGraph: {
    title: "QuickLinks - リンク保存が秒で終わる",
    description: "気になった記事を一瞬で保存し、後でまとめて読めるツール。",
    images: ["/images/toppage.jpeg"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="py-6 px-4 md:px-8 max-w-7xl mx-auto w-full flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary"
        >
          QuickLinks
        </Link>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">サインイン</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">無料で始める</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              リンク保存が、
              <span className="text-primary block md:inline">秒で終わる。</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              気になった記事を一瞬で保存し、後でまとめて読める。
              <br className="hidden md:inline" />
              あなたの情報収集を加速させるブックマークツール。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/sign-up">
                今すぐ始める <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-lg"
              asChild
            >
              <Link href="/sign-in">サインイン</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              シンプルで強力な機能
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <CardTitle>ブラウザ拡張で保存</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    PCなら右クリック、スマホなら共有メニューから一瞬で保存。
                    もう「後で読む」リストが散らかることはありません。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                  <CardTitle>Web でまとめて閲覧</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    保存したリンクは美しいカード形式で整理されます。
                    OGP画像やタイトルも自動取得され、視認性も抜群です。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>AI ダイジェスト</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    週次・月次で保存した記事をAIが要約してダイジェストを作成。
                    積読の消化を強力にサポートします。（Coming Soon）
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Images Section */}
        <section className="py-20 px-4 max-w-6xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-2xl font-bold">
                一瞬で保存、フローを止めない
              </h3>
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
                alt="QuickLinks Extension Demo"
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
                alt="QuickLinks Dashboard Demo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-16">3ステップで始める</h2>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

              <div className="space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                  1
                </div>
                <h3 className="text-xl font-bold">拡張機能を導入</h3>
                <p className="text-muted-foreground">
                  Chrome ウェブストアから
                  <br />
                  拡張機能をインストール
                </p>
              </div>

              <div className="space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                  2
                </div>
                <h3 className="text-xl font-bold">サインアップ</h3>
                <p className="text-muted-foreground">
                  アカウントを作成して
                  <br />
                  認証を完了
                </p>
              </div>

              <div className="space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                  3
                </div>
                <h3 className="text-xl font-bold">保存＆閲覧</h3>
                <p className="text-muted-foreground">
                  気になったら即保存、
                  <br />
                  あとでゆっくり閲覧
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
              QuickLinks で、積読を消化する新しい習慣を始めましょう。
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
            <span className="text-lg font-bold">QuickLinks</span>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QuickLinks. All rights reserved.
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
