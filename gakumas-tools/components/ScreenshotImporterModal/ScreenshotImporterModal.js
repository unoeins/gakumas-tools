"use client";
import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaRegPaste } from "react-icons/fa6";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import styles from "./ScreenshotImporterModal.module.scss";

// importFn takes the chosen file, or with maxFiles > 1 an array of up to
// maxFiles of them.
function ScreenshotImporterModal({
  translationNamespace,
  importFn,
  onSuccess,
  maxFiles = 1,
}) {
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
    [importFn, onSuccess, maxFiles],
  );

  const handleFile = useCallback(
    async (e) => {
      const files = [...e.target.files].slice(0, maxFiles);
      // Clear the input so choosing the same file again (to retry) fires
      // another change.
      e.target.value = "";
      if (!files.length) return;
      handleItem(maxFiles > 1 ? files : files[0]);
    },
    [handleItem],
  );

  const readFromClipboard = useCallback(
    async () => {
      try {
        const items = await navigator.clipboard.read();
        const files = await Promise.all(items
          .map(item => {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
              return item.getType(imageType);
            }
            return null;
          })
          .filter(blob => blob));
        if (!files.length) {
          setError(t("noImageInClipboard"));
          return;
        }
        handleItem(maxFiles > 1 ? files : files[0]);
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
          const files = [...items]
            .filter(item => item.type.startsWith('image/'))
            .map(item => item.getAsFile());
          if (!files.length) {
            setError(t("noImageInClipboard"));
            return;
          }
          handleItem(maxFiles > 1 ? files : files[0]);
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
    // Closing mid-import would let the result land on whatever is open next.
    <Modal dismissable={!loading}>
      <h3>{t("title")}</h3>
      <p className={styles.instructions}>{t("instructions")}</p>

      <input
        className={styles.file}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
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
