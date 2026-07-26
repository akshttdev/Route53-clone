"use client";

import Link from "@cloudscape-design/components/link";

export function ConsoleFooter() {
  return (
    <footer className="aws-console-footer">
      <div className="aws-console-footer__left">
        <button type="button" className="aws-console-footer__btn">
          CloudShell
        </button>
        <button type="button" className="aws-console-footer__btn">
          Feedback
        </button>
      </div>
      <div className="aws-console-footer__right">
        <span>© {new Date().getFullYear()}, Amazon Web Services, Inc. or its affiliates.</span>
        <Link href="#" external fontSize="body-s" color="inverted">
          Privacy
        </Link>
        <Link href="#" external fontSize="body-s" color="inverted">
          Terms
        </Link>
        <Link href="#" external fontSize="body-s" color="inverted">
          Cookie preferences
        </Link>
      </div>
    </footer>
  );
}
