import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const Sidebar = ({ isOpen, onClose, navigation, currentRoute }) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'grid-outline', route: 'Dashboard' },
    { label: 'Proje Oluştur', icon: 'add-circle-outline', route: 'CreateProject' },
    { label: 'İstatistikler', icon: 'stats-chart-outline', route: 'Stats' },
    { label: 'Ayarlar', icon: 'settings-outline', route: 'Settings' },
  ];

  const styles = createStyles(colors);

  return (
    <Animated.View 
      style={[styles.overlayContainer, { opacity: opacityAnim }]} 
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      <Animated.View style={[
        styles.sidebar, 
        { 
          transform: [{ translateX: slideAnim }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom || 20 // En az 20px veya safe area
        }
      ]}>
        <View style={styles.header}>
          <Text style={styles.logoText}>VeloPath</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.route}
              style={[styles.menuItem, currentRoute === item.route && styles.activeItem]}
              onPress={() => {
                onClose();
                navigation.navigate(item.route);
              }}
            >
              <Ionicons 
                name={item.icon} 
                size={22} 
                color={currentRoute === item.route ? colors.accent : colors.textSecondary} 
              />
              <Text style={[styles.menuLabel, currentRoute === item.route && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.danger} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sidebar: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: width * 0.75,
    backgroundColor: colors.bg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20, // insets.top zaten sidebar'a verildi
    marginBottom: 30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.accent,
  },
  menu: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: RADIUS.md,
    gap: 15,
    marginBottom: 5,
  },
  activeItem: {
    backgroundColor: `${colors.accent}15`,
  },
  menuLabel: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.accent,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Sidebar;
