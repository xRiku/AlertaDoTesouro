import React, {
  InputHTMLAttributes,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { IconBaseProps } from 'react-icons';
import { useField } from '@unform/core';

import { Container, Error } from './styles';
import { FiAlertCircle } from 'react-icons/fi';
import Tooltip from '../Tooltip';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  icon?: React.ComponentType<IconBaseProps>;
}

const Input: React.FC<InputProps> = ({ name, icon: Icon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, error, registerField } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputRef.current?.value);
  }, []);

  return (
    <Container isFocused={isFocused} isFilled={isFilled} isErrored={!!error}>
      <div id="svg-div">{Icon && <Icon size={20} />}</div>
      <input
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        ref={inputRef}
        {...props}
      />

      {error &&
      <Error title={error}>
        <FiAlertCircle color="#e63232" size={20}/>
      </Error>}
    </Container>
  );
};

export default Input;
