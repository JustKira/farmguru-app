import '~/lib/database/index';

import { useGlobalSearchParams, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { cssInterop } from 'nativewind';
import { Airplay, Cloud, DropHalfBottom, MapTrifold, Plant, Scan } from 'phosphor-react-native';
import { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';

import CustomDrawerFieldContent from '~/components/custom-field-drawer';
import { Button } from '~/components/ui/button';
import { useTranslation } from 'react-i18next';

const MapButton = ({ type }: { type: string }) => {
  const params = useGlobalSearchParams();
  const router = useRouter();

  return (
    <Button
      size="icon"
      variant="secondary"
      className="mr-2"
      onPress={() => {
        //@ts-ignore
        router.navigate(`/field/${params.fid as string}/(drawer)/map?type=${type}`);
      }}>
      <MapTrifold weight="bold" />
    </Button>
  );
};

export default function _layout() {
  const { t } = useTranslation();
  return (
    <CustomDrawer drawerClassName="bg-background" drawerContent={CustomDrawerFieldContent}>
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: t('navigation.general'),
          drawerLabel: t('navigation.general'),
          drawerIcon: ({ size, color }) => <Airplay size={size} color={color} />,
          headerRight: () => <MapButton type="general" />,
        }}
      />
      <Drawer.Screen
        name="irrigation"
        options={{
          headerTitle: t('navigation.irrigation'),
          drawerLabel: t('navigation.irrigation'),
          drawerIcon: ({ size, color }) => <DropHalfBottom size={size} color={color} />,
          headerRight: () => <MapButton type="irrigation" />,
        }}
      />
      <Drawer.Screen
        name="crop"
        options={{
          headerTitle: t('navigation.crop'),
          drawerLabel: t('navigation.crop'),
          drawerIcon: ({ size, color }) => <Plant size={size} color={color} />,
          headerRight: () => <MapButton type="crop" />,
        }}
      />
      <Drawer.Screen
        name="scout"
        options={{
          headerTitle: t('navigation.scout'),
          drawerLabel: t('navigation.scout'),
          drawerIcon: ({ size, color }) => <Scan size={size} color={color} />,
          headerRight: () => <MapButton type="scout" />,
        }}
      />
      <Drawer.Screen
        name="weather"
        options={{
          headerTitle: t('navigation.weather'),
          drawerLabel: t('navigation.weather'),
          drawerItemStyle: { height: 0 },
          drawerIcon: ({ size, color }) => <Cloud size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="map"
        options={{
          headerTitle: t('navigation.home'),
          drawerLabel: 'Map',
          drawerItemStyle: { height: 0 },
        }}
      />
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
