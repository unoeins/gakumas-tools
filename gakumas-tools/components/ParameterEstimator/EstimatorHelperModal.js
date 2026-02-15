import { memo, useContext, useState } from "react";
import { FaTrophy } from "react-icons/fa6";
import { AiOutlineTool } from "react-icons/ai";
import { useTranslations } from "next-intl";
import ModalContext from "@/contexts/ModalContext";
import Button from "@/components/Button";
import ButtonGroup from "@/components/ButtonGroup";
import Image from "@/components/Image";
import Modal from "@/components/Modal";
import { useRouter } from "@/i18n/routing";
import styles from "./EstimatorHelperModal.module.scss";

function EstimatorHelperModal() {
  const t = useTranslations("EstimatorHelperModal");
  const router = useRouter();
  const { closeModal } = useContext(ModalContext);
  const [step, setStep] = useState(1);

  function goToSimulator() {
    closeModal();
    router.push("/simulator");
  }

  return (
    <Modal>
      <h3>{t("estimatorHelper")}</h3>

      <ButtonGroup
        className={styles.stepSelect}
        options={[
          { value: 1, label: "Step 1" },
          { value: 2, label: "Step 2" },
        ]}
        selected={step}
        onChange={setStep}
      />

      {step === 1 && (
        <div className={styles.help}>
          <Image
            src="/estimator_simulator_reference.webp"
            width={216}
            height={295}
            alt=""
          />

          <div>
            {t.rich("instructionsSimulator", {
              p: (chunks) => <p>{chunks}</p>,
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.help}>
          <Image
            src="/estimator_result_reference.webp"
            width={216}
            height={213}
            alt=""
          />

          <div>
            {t.rich("instructionsResult", {
              p: (chunks) => <p>{chunks}</p>,
              tools: (chunks) => <AiOutlineTool/>,
            })}
          </div>
        </div>
      )}

      <Button style="blue" onClick={goToSimulator}>
        <FaTrophy /> {t("goToSimulator")}
      </Button>
    </Modal>
  );
}

export default memo(EstimatorHelperModal);
