import { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps {
  type: string;
  placeholder: string;
  autocomplete?: string;
  register: UseFormRegisterReturn;
  children?: React.ReactNode;
}

const InputField = ({
  type,
  placeholder,
  autocomplete,
  register,
  children,
}: InputFieldProps) => {
  return (
    <div className="min-h-[6rem]">
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autocomplete}
        className="w-full p-3 mb-2 bg-white rounded-lg outline-none placeholder-cta-secondary"
        {...register}
      />
      {children}
    </div>
  );
};

export default InputField;
