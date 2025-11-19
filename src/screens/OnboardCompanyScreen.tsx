import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { theme } from '../theme/colors';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import DocumentTypePicker, { DocumentType } from '../components/ui/DocumentTypePicker';
import { companiesApi, CreateCompanyRequest } from '../services/api/companies';
import { uploadApi, UploadFile } from '../services/api/upload';
import { authService } from '../services/api/auth';
import { getNameError, getEmailError, getAdminPasswordError } from '../utils/validation';
import { showToast } from '../utils/toast';

export default function OnboardCompanyScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    initial_user: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    initial_user?: {
      name?: string;
      email?: string;
      password?: string;
    };
    identityProof?: string;
  }>({});

  // Identity proof state
  const [documentType, setDocumentType] = useState<DocumentType | undefined>();
  const [identityProofFiles, setIdentityProofFiles] = useState<
    Array<{
      uri: string;
      type: string;
      fileName: string;
      documentType: DocumentType;
      id?: string;
    }>
  >([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleSubmit = async () => {
    // Trim all input values before validation
    const trimmedFormData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
      initial_user: {
        ...formData.initial_user,
        name: formData.initial_user.name.trim(),
        email: formData.initial_user.email.trim(),
        phone: formData.initial_user.phone?.trim() || '',
        password: formData.initial_user.password.trim(),
      },
    };

    // Validation
    const nameError = getNameError(trimmedFormData.name);
    const emailError = getEmailError(trimmedFormData.email);
    const userNameError = getNameError(trimmedFormData.initial_user.name);
    const userEmailError = getEmailError(trimmedFormData.initial_user.email);
    const userPasswordError = getAdminPasswordError(trimmedFormData.initial_user.password);
    const identityProofError =
      identityProofFiles.length === 0
        ? 'Please upload at least one identity proof document'
        : undefined;

    if (nameError || emailError || userNameError || userEmailError || userPasswordError || identityProofError) {
      setErrors({
        name: nameError,
        email: emailError,
        initial_user: {
          name: userNameError,
          email: userEmailError,
          password: userPasswordError,
        },
        identityProof: identityProofError,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Get current user to include salesman_id
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        showToast.error('User session expired. Please login again.');
        return;
      }

      // Step 1: Create company with trimmed data and salesman_id
      const companyDataWithSalesmanId: CreateCompanyRequest = {
        ...trimmedFormData,
        salesman_id: currentUser.id, // Include salesman_id in request
      };

      const response = await companiesApi.create(companyDataWithSalesmanId);
      if (!response) {
        throw new Error('Failed to create company');
      }

      // Step 2: Upload identity proof documents
      if (identityProofFiles.length > 0) {
        setUploadingFiles(true);
        try {
          const uploadPromises = identityProofFiles.map(async (file) => {
            const uploadFile: UploadFile = {
              uri: file.uri,
              type: file.type,
              fileName: file.fileName,
            };
            return await uploadApi.uploadSingle(uploadFile, 'document', response.company.id);
          });

          const uploadResults = await Promise.all(uploadPromises);
          const failedUploads = uploadResults.filter((result) => !result);

          if (failedUploads.length > 0) {
            showToast.error(
              `${failedUploads.length} file(s) failed to upload. Company created but documents may be missing.`,
            );
          } else {
            showToast.success('Company and identity proof documents uploaded successfully!');
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          showToast.warning(
            'Company created but some documents failed to upload. You can add them later.',
          );
        } finally {
          setUploadingFiles(false);
        }
      } else {
        showToast.success('Company created successfully!');
      }

      (navigation as any).navigate('CompanyDetails', { data: response });
    } catch (error: any) {
      console.error('Create company error:', error);
      
      // Handle API validation errors
      if (error.response?.data?.error || error.error) {
        const apiError = error.response?.data?.error || error.error;
        const errorCode = apiError.code;
        const errorMessage = apiError.message;

        // Map backend validation errors to form fields
        if (errorCode === 'VALIDATION_ERROR') {
          // Check if error message contains field-specific information
          if (errorMessage.includes('name') && errorMessage.includes('email') && errorMessage.includes('password')) {
            // General validation error - could be any of the required fields
            setErrors(prev => ({
              ...prev,
              initial_user: {
                ...prev.initial_user,
                password: errorMessage.includes('password') ? 'Password is required' : prev.initial_user?.password,
              },
            }));
          } else if (errorMessage.includes('Password must be at least 8 characters')) {
            setErrors(prev => ({
              ...prev,
              initial_user: {
                ...prev.initial_user,
                password: 'Password must be at least 8 characters long',
              },
            }));
          } else if (errorMessage.includes('email')) {
            if (errorMessage.includes('company')) {
              setErrors(prev => ({ ...prev, email: 'Company email is invalid or already exists' }));
            } else {
              setErrors(prev => ({
                ...prev,
                initial_user: {
                  ...prev.initial_user,
                  email: 'User email is invalid or already exists',
                },
              }));
            }
          } else if (errorMessage.includes('name')) {
            if (errorMessage.includes('company')) {
              setErrors(prev => ({ ...prev, name: 'Company name is required' }));
            } else {
              setErrors(prev => ({
                ...prev,
                initial_user: {
                  ...prev.initial_user,
                  name: 'User name is required',
                },
              }));
            }
          } else {
            // Generic validation error - show in toast
            showToast.error(errorMessage);
          }
        } else if (errorCode === 'DUPLICATE_ENTRY') {
          if (errorMessage.includes('Company')) {
            setErrors(prev => ({ ...prev, email: 'Company with this email already exists' }));
          } else if (errorMessage.includes('User')) {
            setErrors(prev => ({
              ...prev,
              initial_user: {
                ...prev.initial_user,
                email: 'User with this email already exists',
              },
            }));
          } else {
            showToast.error(errorMessage);
          }
        } else if (errorCode === 'FORBIDDEN') {
          showToast.error('You do not have permission to create companies');
        } else if (errorCode === 'NETWORK_ERROR' || errorCode === 'TIMEOUT') {
          showToast.error('Network error. Please check your connection and try again.');
        } else {
          showToast.error(errorMessage || 'Failed to create company. Please try again.');
        }
      } else {
        // Generic error handling
        const errorMessage = error.message || 'Failed to create company. Please try again.';
        showToast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('initial_user.')) {
      const userField = field.replace('initial_user.', '');
      setFormData(prev => ({
        ...prev,
        initial_user: {
          ...prev.initial_user,
          [userField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear errors
    if (field.startsWith('initial_user.')) {
      const userField = field.replace('initial_user.', '');
      if (errors.initial_user?.[userField as keyof typeof errors.initial_user]) {
        setErrors(prev => ({
          ...prev,
          initial_user: {
            ...prev.initial_user,
            [userField]: undefined,
          },
        }));
      }
    } else if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePickImage = () => {
    if (!documentType) {
      showToast.error('Please select document type first');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          showToast.error(response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const newFiles = response.assets.map((asset) => ({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
            documentType: documentType,
          }));
          setIdentityProofFiles((prev) => [...prev, ...newFiles]);
          setErrors((prev) => ({ ...prev, identityProof: undefined }));
        }
      },
    );
  };

  const handlePickDocument = async () => {
    if (!documentType) {
      showToast.error('Please select document type first');
      return;
    }

    // Document picker functionality removed - react-native-document-picker was uninstalled
    showToast.error('Document picker is not available. Please use image picker instead.');
  };

  const removeFile = (index: number) => {
    setIdentityProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return 'image';
    }
    if (type.includes('pdf')) {
      return 'file-pdf-box';
    }
    if (type.includes('word') || type.includes('document')) {
      return 'file-word-box';
    }
    return 'file-document';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Onboard Company</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <Icon name="office-building" size={20} color={theme.primary} />
              <CardTitle>Company Information</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Input
              label="Company Name *"
              placeholder="Enter company name"
              value={formData.name}
              onChangeText={value => handleInputChange('name', value)}
              error={errors.name}
              containerStyle={styles.input}
            />
            <Input
              label="Company Email *"
              placeholder="company@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              error={errors.email}
              containerStyle={styles.input}
            />
            <Input
              label="Company Phone"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={value => handleInputChange('phone', value)}
              containerStyle={styles.input}
            />
            <Input
              label="Company Address"
              placeholder="Enter company address"
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              multiline
              numberOfLines={3}
              containerStyle={styles.input}
            />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <Icon name="account" size={20} color={theme.primary} />
              <CardTitle>Initial Admin User</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Input
              label="User Name *"
              placeholder="Enter admin user name"
              value={formData.initial_user.name}
              onChangeText={value => handleInputChange('initial_user.name', value)}
              error={errors.initial_user?.name}
              containerStyle={styles.input}
            />
            <Input
              label="User Email *"
              placeholder="admin@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.initial_user.email}
              onChangeText={value => handleInputChange('initial_user.email', value)}
              error={errors.initial_user?.email}
              containerStyle={styles.input}
            />
            <Input
              label="User Phone"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={formData.initial_user.phone}
              onChangeText={value => handleInputChange('initial_user.phone', value)}
              containerStyle={styles.input}
            />
            <Input
              label="Password *"
              placeholder="Enter password (min 8 characters)"
              value={formData.initial_user.password || ''}
              onChangeText={value => handleInputChange('initial_user.password', value)}
              error={errors.initial_user?.password}
              secureTextEntry={!showPassword}
              containerStyle={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.mutedForeground}
                  />
                </TouchableOpacity>
              }
            />
            <Text style={styles.helpText}>
              Password must be at least 8 characters long. Use a strong password with letters, numbers, and special characters.
            </Text>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <Icon name="card-account-details" size={20} color={theme.primary} />
              <CardTitle>Broker Identity Proof *</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <DocumentTypePicker
              label="Document Type *"
              value={documentType}
              onValueChange={setDocumentType}
              error={errors.identityProof && !documentType ? errors.identityProof : undefined}
            />

            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImage}
                disabled={!documentType}
              >
                <Icon
                  name="camera"
                  size={20}
                  color={documentType ? theme.primary : theme.mutedForeground}
                />
                <Text
                  style={[
                    styles.uploadButtonText,
                    !documentType && styles.uploadButtonTextDisabled,
                  ]}
                >
                  Add Photos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickDocument}
                disabled={!documentType}
              >
                <Icon
                  name="file-document"
                  size={20}
                  color={documentType ? theme.primary : theme.mutedForeground}
                />
                <Text
                  style={[
                    styles.uploadButtonText,
                    !documentType && styles.uploadButtonTextDisabled,
                  ]}
                >
                  Add PDF/DOC
                </Text>
              </TouchableOpacity>
            </View>

            {identityProofFiles.length > 0 && (
              <View style={styles.filesList}>
                <Text style={styles.filesListTitle}>
                  Uploaded Documents ({identityProofFiles.length})
                </Text>
                {identityProofFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Icon
                        name={getFileIcon(file.type)}
                        size={24}
                        color={theme.primary}
                      />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.fileName}
                        </Text>
                        <Text style={styles.fileType}>{file.documentType}</Text>
                      </View>
                    </View>
                    {file.uri.startsWith('file://') && file.type.startsWith('image/') && (
                      <Image source={{ uri: file.uri }} style={styles.fileThumbnail} />
                    )}
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      style={styles.removeButton}
                    >
                      <Icon name="close-circle" size={24} color={theme.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {errors.identityProof && identityProofFiles.length === 0 && (
              <Text style={styles.errorText}>{errors.identityProof}</Text>
            )}

            <Text style={styles.helpText}>
              Upload photos or documents (PDF, DOC, DOCX) as identity proof. You can upload
              multiple files.
            </Text>
          </CardContent>
        </Card>

        <Button
          title={
            loading
              ? uploadingFiles
                ? 'Uploading Documents...'
                : 'Creating...'
              : 'Create Company'
          }
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  uploadButtonTextDisabled: {
    color: theme.mutedForeground,
  },
  filesList: {
    marginTop: 8,
  },
  filesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.foreground,
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
    marginBottom: 4,
  },
  fileType: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  fileThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: theme.muted,
  },
  removeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: theme.destructive,
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 8,
    lineHeight: 16,
  },
});

