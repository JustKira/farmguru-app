import '~/lib/database/index';

import { Drawer } from 'expo-router/drawer';
import { cssInterop } from 'nativewind';
import { UserCircle, Farm } from 'phosphor-react-native';
import { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';

import CustomAppDrawerContent from '~/components/custom-app-drawer';
import { useTranslation } from 'react-i18next';

// import { ThemeToggle } from '~/components/theme-toggle';

export default function _layout() {
  const { t } = useTranslation();
  return (
    <CustomDrawer
      drawerClassName="bg-background"
      drawerContent={CustomAppDrawerContent}
      // screenOptions={{
      //   headerRight: () => <ThemeToggle />,
      // }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: t('navigation.farm'),
          drawerLabel: t('navigation.farm'),
          drawerIcon: ({ size, color }) => <Farm size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          headerTitle: t('navigation.profile'),
          drawerLabel: t('navigation.profile'),
          drawerIcon: ({ size, color }) => <UserCircle size={size} color={color} />,
        }}
      />
      {/* <Drawer.Screen
        name="irrigation"
        options={{
          // headerTitle: t('navigation.home'),
          drawerLabel: 'Irrigation',
          drawerIcon: ({ size, color }) => <DropHalfBottom size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="crop"
        options={{
          // headerTitle: t('navigation.home'),
          drawerLabel: 'Crop',
          drawerIcon: ({ size, color }) => <Plant size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="scout"
        options={{
          // headerTitle: t('navigation.home'),
          drawerLabel: 'Scout',
          drawerIcon: ({ size, color }) => <Scan size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="weather"
        options={{
          // headerTitle: t('navigation.home'),
          drawerLabel: 'Weather',
          drawerIcon: ({ size, color }) => <Cloud size={size} color={color} />,
        }}
      /> */}
    </CustomDrawer>
  );
}

// type CustomTabsProps = Omit<
//   ComponentProps<typeof Drawer> & {
//     drawerStyle?: ViewStyle;
//     headerRight: () => JSX.Element;
//   },
//   'screenOptions'
// >;

interface CustomDrawerProps extends ComponentProps<typeof Drawer> {
  drawerStyle?: ViewStyle;
}

const CustomDrawer = cssInterop(
  ({ drawerStyle, ...props }: CustomDrawerProps) => (
    <Drawer screenOptions={{ drawerStyle, ...props.screenOptions }} {...props} />
  ),
  {
    drawerClassName: 'drawerStyle',
  }
);
