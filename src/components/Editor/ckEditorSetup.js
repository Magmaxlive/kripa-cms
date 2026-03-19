export { CKEditor } from "@ckeditor/ckeditor5-react";
export {
  ClassicEditor,
  Essentials, Heading,
  Bold, Italic, Underline,
  List, BlockQuote, Link,
  Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize,
  Table, TableToolbar,
  MediaEmbed,
  Undo,
} from "ckeditor5";

export const EDITOR_PLUGINS = [
  Essentials, Heading,
  Bold, Italic, Underline,
  List, BlockQuote, Link,
  Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize,
  Table, TableToolbar,
  MediaEmbed,
  Undo,
];

export const EDITOR_TOOLBAR = [
  "heading", "|",
  "bold", "italic", "underline", "|",
  "bulletedList", "numberedList", "|",
  "blockQuote", "link", "|",
  "insertTable", "mediaEmbed", "|",
  "uploadImage", "|",
  "undo", "redo",
];

export const EDITOR_IMAGE_CONFIG = {
  toolbar: [
    "imageStyle:alignLeft", "imageStyle:alignCenter", "imageStyle:alignRight",
    "|", "imageResize", "|", "imageTextAlternative",
  ],
  resizeUnit: "%",
  resizeOptions: [
    { name: "imageResize:original", label: "Original", value: null },
    { name: "imageResize:25",       label: "25%",       value: "25" },
    { name: "imageResize:50",       label: "50%",       value: "50" },
    { name: "imageResize:75",       label: "75%",       value: "75" },
  ],
};

export const EDITOR_TABLE_CONFIG = {
  contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
};