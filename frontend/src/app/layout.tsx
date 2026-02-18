import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Locobuy - 讓在地購物變得簡單',
    description: '連結當地賣家，透過 Locobuy 輕鬆找到附近的商品。',
    keywords: ['在地購物', '附近商品', '取貨地點', '地方賣家', '電商'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-TW">
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
