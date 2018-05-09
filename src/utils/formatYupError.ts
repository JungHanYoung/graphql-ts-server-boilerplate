import { pick } from "lodash";
import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
      let errors: Array<{path: string, message: string}> = [];
      err.inner.forEach((e: ValidationError) => {
            const error = pick(e, ['path', 'message']);
            errors.push(error);
      });

      return errors;
}