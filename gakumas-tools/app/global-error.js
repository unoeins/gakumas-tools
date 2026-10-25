"use client";
import buttonStyles from "@/components/Button/Button.module.scss";
import errorStyles from "@/components/Error/Error.module.scss";
import Image from "@/components/Image";
import c from "@/utils/classNames";
import "./globals.scss";

export default function GlobalError({ retry }) {
  return (
    <html lang="ja">
      <body>
        <div className={errorStyles.error}>
          <h2>エラーが発生しました / Something went wrong</h2>
          <div className={errorStyles.actions}>
            <button
              className={c(
                buttonStyles.button,
                buttonStyles.primary,
                buttonStyles.md
              )}
              onClick={retry}
            >
              再試行 / Try again
            </button>
            <a
              className={c(
                buttonStyles.button,
                buttonStyles.default,
                buttonStyles.md
              )}
              href="/"
            >
              ホーム / Home
            </a>
          </div>
          <div className={errorStyles.wrapper}>
            <Image
              src="/errors/generic.jpg"
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        </div>
      </body>
    </html>
  );
}
