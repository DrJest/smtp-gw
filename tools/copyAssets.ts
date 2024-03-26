import * as shell from "shelljs";

shell.cp("-R", "src/static", "dist/");
shell.cp("-R", "src/certs", "dist/");
shell.cp("-R", "src/views", "dist/");
shell.cp("-R", "src/.env", "dist/");