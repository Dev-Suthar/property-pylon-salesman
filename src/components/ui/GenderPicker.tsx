import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme/colors';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

interface GenderPickerProps {
  value?: Gender;
  onValueChange: (value: Gender) => void;
  label?: string;
  error?: string;
}

const genders: Gender[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function GenderPicker({
  value,
  onValueChange,
  label,
  error,
}: GenderPickerProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const getIcon = (gender: Gender) => {
    switch (gender) {
      case 'Male':
        return 'gender-male';
      case 'Female':
        return 'gender-female';
      case 'Other':
        return 'gender-non-binary';
      case 'Prefer not to say':
        return 'account-question';
      default:
        return 'account';
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.picker, error && styles.pickerError]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.pickerContent}>
          {value ? (
            <View style={styles.selectedValue}>
              <Icon name={getIcon(value)} size={20} color={theme.primary} />
              <Text style={styles.selectedText}>{value}</Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>Select gender</Text>
          )}
          <Icon name="chevron-down" size={20} color={theme.mutedForeground} />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsList}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.option,
                    value === gender && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onValueChange(gender);
                    setModalVisible(false);
                  }}
                >
                  <Icon
                    name={getIcon(gender)}
                    size={20}
                    color={value === gender ? theme.primary : theme.foreground}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      value === gender && styles.optionTextSelected,
                    ]}
                  >
                    {gender}
                  </Text>
                  {value === gender && (
                    <Icon name="check" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
    marginBottom: 8,
  },
  picker: {
    height: 44,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pickerError: {
    borderColor: theme.destructive,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    color: theme.foreground,
  },
  placeholder: {
    fontSize: 16,
    color: theme.mutedForeground,
  },
  errorText: {
    fontSize: 12,
    color: theme.destructive,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  optionsList: {
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: `${theme.primary}15`,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: theme.foreground,
  },
  optionTextSelected: {
    color: theme.primary,
    fontWeight: '600',
  },
});

