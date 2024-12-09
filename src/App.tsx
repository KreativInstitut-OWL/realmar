import { saveAs } from "file-saver";
import JSZip from "jszip";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AppLayout from "./components/AppLayout";
import generateIndexHtml from "./lib/generateIndexHtml";
import compileImageTargets from "./lib/uploadAndCompile";
import { queryClient } from "./store/query-client";
import { AssetWithFile } from "./store";

function App() {
  const [exportProgress, setExportProgress] = useState<number>(0);

  // const { language } = useLanguage();
  // const uiText = language === "en" ? ui.en : ui.de;
  // const contentText = language === "en" ? content.en : content.de;

  // const renameFile = (file: File, index: number) => {
  //   const fileExtension = file.name.split(".").pop();
  //   return `target${index}.${fileExtension}`;
  // };

  // const errors: ErrorState = {};
  // if (markers.length <= 0 && images.length <= 0) {
  //   errors.noInput = uiText.errors.noInput;
  // }
  // if (markers.length !== images.length) {
  //   errors.missingPair = uiText.errors.missingPair;
  // }

  // const hasErrors = Object.keys(errors).length > 0;

  // function handleBundleFiles() {
  // if (markers.length === 0 || images.length === 0) {
  //   alert(uiText.errors.missingPair);
  //   return;
  // }

  // }

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  );
}

export default App;
