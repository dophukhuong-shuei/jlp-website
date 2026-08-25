import { defineMiddlewares } from "@medusajs/framework/http";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/import-supplier",
      method: "POST",
      middlewares: [upload.single("file")],
    },
  ],
});
