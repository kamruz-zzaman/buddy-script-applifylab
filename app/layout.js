import "./globals.css";
import BootstrapClient from "../components/common/BootstrapClient";

export const metadata = {
  title: "Buddy Script",
  description: "Buddy Script - Social Platform",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BootstrapClient>{children}</BootstrapClient>
      </body>
    </html>
  );
}
