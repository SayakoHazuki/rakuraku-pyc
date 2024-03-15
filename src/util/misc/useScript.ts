import { useEffect } from "react";

const useScript = (url: string, defer = false, onload?: () => void) => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = url;
    script.async = true;
    script.defer = defer;
    if (onload) {
      script.onload = onload;
    }

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [url, defer, onload]);
};

export default useScript;
