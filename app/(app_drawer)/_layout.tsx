import '~/lib/database/index';

import { Drawer } from 'expo-router/drawer';
import { cssInterop } from 'nativewind';
import { UserCircle, Farm } from 'phosphor-react-native';
import { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';

import CustomAppDrawerContent from '~/components/custom-app-drawer';

// import { ThemeToggle } from '~/components/theme-toggle';

export default function _layout() {
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
          // headerTitle: t('navigation.home'),

          drawerLabel: 'Farms',
          drawerIcon: ({ size, color }) => <Farm size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          headerTitle: 'Profile',
          drawerLabel: 'Profile',
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
