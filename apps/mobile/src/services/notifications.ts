import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let initialized = false;

/** Requests permission and sets up the Android channel. Safe to call more than once. */
export async function initNotifications() {
  if (initialized) return;
  initialized = true;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest timer',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await Notifications.requestPermissionsAsync();
}

/** Schedules the "rest is over" alert to fire in `seconds` from now. Returns the notification id so it can be cancelled or rescheduled. */
export async function scheduleRestEndNotification(seconds: number, exerciseName: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rest over',
      body: `Time for your next set of ${exerciseName}.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
      repeats: false,
    },
  });
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
