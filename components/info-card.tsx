import { View } from 'react-native';

import { Text } from './ui/text';

import { cn } from '~/lib/utils';

export interface InfoCardProps {
  iconClassName?: string;
  icon: JSX.Element;
  cardHeader: {
    subTitle: string;
    title: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const InfoCard = (props: InfoCardProps) => {
  return (
    <View
      className={cn(
        'flex h-[200px] flex-col rounded-xl border border-border bg-card/75 p-4 md:h-[150px] lg:h-[250px]',
        props.className
      )}>
      <View className="flex-row items-center">
        <View
          className={cn(
            'flex size-12 items-center justify-center rounded-md bg-muted',
            props.iconClassName
          )}>
          {props.icon}
        </View>

        <View className="ml-2 flex-1">
          <Text className="text-sm text-muted-foreground">{props.cardHeader.subTitle}</Text>
          <Text className="text-xl font-semibold text-foreground">{props.cardHeader.title}</Text>
        </View>
      </View>
      {props.children ? <View className="mt-2 flex flex-col gap-1.5">{props.children}</View> : null}
    </View>
  );
};
