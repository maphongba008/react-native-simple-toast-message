import { useState, useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const onKeyboardWillShow = (event: any) => {
    setKeyboardHeight(event.endCoordinates.height);
  };

  const onKeyboardWillHide = () => {
    setKeyboardHeight(0);
  };

  useEffect(() => {
    const sub1 = Keyboard.addListener(isAndroid ? 'keyboardDidShow' : 'keyboardWillShow', onKeyboardWillShow);
    const sub2 = Keyboard.addListener(isAndroid ? 'keyboardDidHide' : 'keyboardWillHide', onKeyboardWillHide);

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return keyboardHeight;
};
