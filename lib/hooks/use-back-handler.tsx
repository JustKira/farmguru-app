import { useEffect } from 'react';
import { BackHandler } from 'react-native';

const useBackHandler = (shouldIntercept: () => boolean, onBackPress: () => void) => {
  useEffect(() => {
    const backAction = () => {
      if (shouldIntercept()) {
        onBackPress();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [shouldIntercept, onBackPress]);
};

export default useBackHandler;
