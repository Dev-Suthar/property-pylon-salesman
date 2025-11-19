import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme/colors';

export type DocumentType =
  | 'Aadhar Card'
  | 'PAN Card'
  | 'Driving License'
  | 'Passport'
  | 'Voter ID'
  | 'Business License'
  | 'GST Certificate'
  | 'Other';

interface DocumentTypePickerProps {
  value?: DocumentType;
  onValueChange: (value: DocumentType) => void;
  label?: string;
  error?: string;
}

const documentTypes: DocumentType[] = [
  'Aadhar Card',
  'PAN Card',
  'Driving License',
  'Passport',
  'Voter ID',
  'Business License',
  'GST Certificate',
  'Other',
];

export default function DocumentTypePicker({
  value,
  onValueChange,
  label,
  error,
}: DocumentTypePickerProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const getIcon = (type: DocumentType) => {
    switch (type) {
      case 'Aadhar Card':
        return 'card-account-details';
      case 'PAN Card':
        return 'card-account-details-outline';
      case 'Driving License':
        return 'license';
      case 'Passport':
        return 'passport';
      case 'Voter ID':
        return 'card-account-details-star';
      case 'Business License':
        return 'file-document';
      case 'GST Certificate':
        return 'certificate';
      default:
        return 'file-document-outline';
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
            <Text style={styles.placeholder}>Select document type</Text>
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
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsList}>
              {documentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    value === type && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onValueChange(type);
                    setModalVisible(false);
                  }}
                >
                  <Icon
                    name={getIcon(type)}
                    size={20}
                    color={value === type ? theme.primary : theme.foreground}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      value === type && styles.optionTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                  {value === type && (
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

