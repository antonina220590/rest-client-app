import * as yup from 'yup';

export const formSchemaSignIn = (t: (key: string) => string) =>
  yup.object().shape({
    email: yup
      .string()
      .trim()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/,
        t('errors.invalidEmailFormat')
      )
      .required(t('errors.emailRequired')),
    password: yup
      .string()
      .min(8, t('errors.passwordMinLength'))
      .matches(/[0-9]/, t('errors.passwordAtLeastOneNumber'))
      .matches(/[A-Z]/, t('errors.passwordAtLeastOneUppercaseLetter'))
      .matches(/[a-z]/, t('errors.passwordAtLeastOneLowercaseLetter'))
      .matches(/[^a-zA-Z0-9]/, t('errors.passwordAtLeastOneSpecialCharacter'))
      .required(t('errors.passwordRequired')),
  });

export const formSchemaSignUp = (t: (key: string) => string) =>
  yup.object().shape({
    name: yup
      .string()
      .trim()
      .matches(/^[A-Z]/, t('errors.nameStartsWithUppercase'))
      .required(t('errors.nameRequired')),
    email: yup
      .string()
      .trim()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/,
        t('errors.invalidEmailFormat')
      )
      .required(t('errors.emailRequired')),
    password: yup
      .string()
      .min(8, t('errors.passwordMinLength'))
      .matches(/[0-9]/, t('errors.passwordAtLeastOneNumber'))
      .matches(/[A-Z]/, t('errors.passwordAtLeastOneUppercaseLetter'))
      .matches(/[a-z]/, t('errors.passwordAtLeastOneLowercaseLetter'))
      .matches(/[^a-zA-Z0-9]/, t('errors.passwordAtLeastOneSpecialCharacter'))
      .required(t('errors.passwordRequired')),
  });
