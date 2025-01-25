import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import { ToastContainer } from 'react-toastify';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MusiX",
  description: "Music player app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossOrigin="anonymous" referrerPolicy="no-referrer"/>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-slate-600 bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] "></div>
        <Navbar/>
        <ToastContainer className="top-12" position="top-right" autoClose={1000} hideProgressBar={false} newestOnTop={true} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        {children}
      </body>
    </html>
  );
}
