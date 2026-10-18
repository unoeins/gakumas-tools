"use client";
import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaRegPaste } from "react-icons/fa6";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import styles from "./ScreenshotImporterModal.module.scss";

function ScreenshotImporterModal({ translationNamespace, importFn, onSuccess }) {
  const t = useTranslations(translationNamespace);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleItem = useCallback(
    async (item) => {
      if (!item) return;
      setLoading(true);
      setError(null);
      try {
        const result = await importFn(item);
        onSuccess(result);
      } catch (err) {
        console.error(err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    },
    [importFn, onSuccess],
  );

  const handleFile = useCallback(
    async (e) => {
      handleItem(e.target.files[0]);
    },
    [handleItem],
  );

  const readFromClipboard = useCallback(
    async () => {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            handleItem(blob);
            return;
          }
        }
        setError(t("noImageInClipboard"));
      } catch (err) {
        console.error(err);
      }
    },
    [handleItem, t],
  );

  useEffect(() => {
    if (window) {
      const pasteHandler = async (e) => {
        try {
          const items = e.clipboardData.items;
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              handleItem(item.getAsFile());
              return;
            }
          }
          setError(t("noImageInClipboard"));
        } catch (err) {
          console.error(err);
        }
      };
      window.addEventListener('paste', pasteHandler);
      return () => {
        window.removeEventListener('paste', pasteHandler);
      };
    }
  }, [handleItem, t]);

  return (
    <Modal>
      <h3>{t("title")}</h3>
      <p className={styles.instructions}>{t("instructions")}</p>

      <input
        className={styles.file}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={loading}
      />

      <Button
        className={styles.pasteButton}
        style="blue-secondary"
        onClick={readFromClipboard}
      >
        <FaRegPaste />
        <span className={styles.buttonText}>{t("readFromClipboard")}</span>
      </Button>

      <div className={styles.feedback} aria-live="polite">
        {loading && (
          <div className={styles.status}>
            <Loader />
            {t("processing")}
          </div>
        )}
        {error && (
          <div className={styles.error}>
            {t("error")}: {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ScreenshotImporterModal;
