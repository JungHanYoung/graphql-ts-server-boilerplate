import * as bcrypt from 'bcryptjs';
import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';
import { passwordNotEnoughLongError, emailNotValid, emailNotEnoughLongError, duplicateEmail } from './errorMessages';
import { createConfirmEmailLink } from '../../utils/createConfirmEmailLink';

const schema = yup.object().shape({
      email: yup
            .string()
            .min(3, emailNotEnoughLongError)
            .max(255)
            .email(emailNotValid),
      password: yup
            .string()
            .min(3, passwordNotEnoughLongError)
            .max(255)
});

export const resolvers: ResolverMap = {
      Query: {
            bye: () => 'bye'
      },

      Mutation: {
            register: async (_: any, { email, password }: GQL.IRegisterOnMutationArguments, { redis, url }) => {

                  try {
                        await schema.validate({
                              email,
                              password
                        }, { abortEarly: false });
                  } catch(err) {
                        // console.log(err);
                        return formatYupError(err);
                  }

                  const userAlreadyExists = await User.findOne({where: { email }, select: ["id"]});
                  if(userAlreadyExists){
                        return [
                              {
                                    path: 'email',
                                    message: duplicateEmail
                              }
                        ]
                  }
              const hashedPassword = await bcrypt.hash(password, 10);
              const user = await User.create({
                email,
                password: hashedPassword
              });

              await user.save();

              const link = await createConfirmEmailLink(url, user.id, redis);
              console.log(link);

              return null;
            }
      }
};