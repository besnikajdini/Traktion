import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
};

export function PlaceholderScreen({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
