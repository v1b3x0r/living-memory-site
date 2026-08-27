import Image from "next/image";
import { siteCopy } from "../content/capability-copy";
import { BASE_PATH } from "../lib/base-path";

export function LmeMark({ href = "#main-content" }: { href?: string }) {
  return (
    <a className="lme-mark" href={href} aria-label={`${siteCopy.brand.name} home`}>
      <Image
        className="lme-mark__icon"
        src={`${BASE_PATH}/favicon.webp`}
        alt=""
        width={128}
        height={128}
        priority
        unoptimized
      />
      <span className="lme-mark__wordmark">{siteCopy.brand.wordmark}</span>
    </a>
  );
}
