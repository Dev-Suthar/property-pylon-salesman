import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { theme } from '../theme/colors';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import DocumentTypePicker, { DocumentType } from '../components/ui/DocumentTypePicker';
import GenderPicker, { Gender } from '../components/ui/GenderPicker';
import { companiesApi, CreateCompanyRequest } from '../services/api/companies';
import { uploadApi, UploadFile } from '../services/api/upload';
import { authService } from '../services/api/auth';
import {
  getNameError,
  getEmailError,
  getAdminPasswordError,
  getPhoneError,
  getAgeError,
  getGenderError,
  getAddressError,
  getTeamMembersError,
  getYearsOfExperienceError,
} from '../utils/validation';
import { showToast } from '../utils/toast';
import { CONFIG } from '../config/config';


import { fonts } from "../theme/typography";
export default function OnboardCompanyScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    team_members: undefined,
    years_of_experience: undefined,
    office_photo_url: undefined,
    initial_user: {
      name: '',
      email: '',
      phone: '',
      address: '',
      age: undefined,
      gender: undefined,
      password: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    team_members?: string;
    years_of_experience?: string;
    initial_user?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      age?: string;
      gender?: string;
      password?: string;
    };
    identityProof?: string;
    officePhoto?: string;
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

  // Office photo state
  const [officePhoto, setOfficePhoto] = useState<{
    uri: string;
    type: string;
    fileName: string;
  } | null>(null);

  // Company address autocomplete
  const [companyAddressSearch, setCompanyAddressSearch] = useState('');
  const [companyAddressSuggestions, setCompanyAddressSuggestions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // User address autocomplete
  const [userAddressSearch, setUserAddressSearch] = useState('');
  const [userAddressSuggestions, setUserAddressSuggestions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [userAddressLoading, setUserAddressLoading] = useState(false);
  const userAddressSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCompanyAddressSuggestions = (query: string) => {
    console.log('[Company Address] fetchCompanyAddressSuggestions called with query:', query);
    
    if (addressSearchTimeout.current) {
      clearTimeout(addressSearchTimeout.current);
      console.log('[Company Address] Cleared previous timeout');
    }

    if (!query || query.length < 3) {
      console.log('[Company Address] Query too short, clearing suggestions');
      setCompanyAddressSuggestions([]);
      return;
    }

    addressSearchTimeout.current = setTimeout(async () => {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query,
      )}&key=${CONFIG.GOOGLE_MAPS_API_KEY}&types=geocode&components=country:in`;
      
      console.log('[Company Address] Making API request:', apiUrl.replace(CONFIG.GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'));
      
      try {
        setAddressLoading(true);
        console.log('[Company Address] Set loading to true');
        
        const response = await fetch(apiUrl);
        console.log('[Company Address] Response status:', response.status, 'ok:', response.ok);
        
        const data = await response.json();
        console.log('[Company Address] Response data:', JSON.stringify(data, null, 2));
        
        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          const suggestions = data.predictions.map((p: any) => ({
            id: p.place_id,
            title: p.description,
          }));
          console.log('[Company Address] Mapped suggestions:', suggestions);
          setCompanyAddressSuggestions(suggestions);
          console.log('[Company Address] Set suggestions count:', suggestions.length);
        } else {
          console.warn('[Company Address] API returned non-OK status or no predictions:', data.status, data.error_message || '');
          setCompanyAddressSuggestions([]);
        }
      } catch (e) {
        console.error('[Company Address] Fetch error:', e);
        console.error('[Company Address] Error details:', {
          message: (e as any)?.message,
          stack: (e as any)?.stack,
        });
        setCompanyAddressSuggestions([]);
      } finally {
        setAddressLoading(false);
        console.log('[Company Address] Set loading to false');
      }
    }, 400);
  };

  const fetchUserAddressSuggestions = (query: string) => {
    console.log('[User Address] fetchUserAddressSuggestions called with query:', query);
    
    if (userAddressSearchTimeout.current) {
      clearTimeout(userAddressSearchTimeout.current);
      console.log('[User Address] Cleared previous timeout');
    }

    if (!query || query.length < 3) {
      console.log('[User Address] Query too short, clearing suggestions');
      setUserAddressSuggestions([]);
      return;
    }

    userAddressSearchTimeout.current = setTimeout(async () => {
      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query,
      )}&key=${CONFIG.GOOGLE_MAPS_API_KEY}&types=geocode&components=country:in`;
      
      console.log('[User Address] Making API request:', apiUrl.replace(CONFIG.GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'));
      
      try {
        setUserAddressLoading(true);
        console.log('[User Address] Set loading to true');
        
        const response = await fetch(apiUrl);
        console.log('[User Address] Response status:', response.status, 'ok:', response.ok);
        
        const data = await response.json();
        console.log('[User Address] Response data:', JSON.stringify(data, null, 2));
        
        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          const suggestions = data.predictions.map((p: any) => ({
            id: p.place_id,
            title: p.description,
          }));
          console.log('[User Address] Mapped suggestions:', suggestions);
          setUserAddressSuggestions(suggestions);
          console.log('[User Address] Set suggestions count:', suggestions.length);
        } else {
          console.warn('[User Address] API returned non-OK status or no predictions:', data.status, data.error_message || '');
          setUserAddressSuggestions([]);
        }
      } catch (e) {
        console.error('[User Address] Fetch error:', e);
        console.error('[User Address] Error details:', {
          message: (e as any)?.message,
          stack: (e as any)?.stack,
        });
        setUserAddressSuggestions([]);
      } finally {
        setUserAddressLoading(false);
        console.log('[User Address] Set loading to false');
      }
    }, 400);
  };

  const handleSubmit = async () => {
    // Trim all input values before validation
    const trimmedFormData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
      team_members: formData.team_members,
      years_of_experience: formData.years_of_experience,
      initial_user: {
        ...formData.initial_user,
        name: formData.initial_user.name.trim(),
        email: formData.initial_user.email.trim(),
        phone: formData.initial_user.phone?.trim() || '',
        address: formData.initial_user.address?.trim() || '',
        age: formData.initial_user.age,
        gender: formData.initial_user.gender,
        password: formData.initial_user.password.trim(),
      },
    };

    // Validation
    const nameError = getNameError(trimmedFormData.name);
    const emailError = getEmailError(trimmedFormData.email);
    const phoneError = getPhoneError(trimmedFormData.phone || '');
    const teamMembersError = getTeamMembersError(trimmedFormData.team_members);
    const yearsOfExperienceError = getYearsOfExperienceError(trimmedFormData.years_of_experience);
    const userNameError = getNameError(trimmedFormData.initial_user.name);
    const userEmailError = getEmailError(trimmedFormData.initial_user.email);
    const userPhoneError = getPhoneError(trimmedFormData.initial_user.phone || '');
    const userAddressError = getAddressError(trimmedFormData.initial_user.address);
    const userAgeError = getAgeError(trimmedFormData.initial_user.age);
    const userGenderError = getGenderError(trimmedFormData.initial_user.gender);
    const userPasswordError = getAdminPasswordError(trimmedFormData.initial_user.password);
    const identityProofError =
      identityProofFiles.length === 0
        ? 'Please upload at least one identity proof document'
        : undefined;

    if (
      nameError ||
      emailError ||
      phoneError ||
      teamMembersError ||
      yearsOfExperienceError ||
      userNameError ||
      userEmailError ||
      userPhoneError ||
      userAddressError ||
      userAgeError ||
      userGenderError ||
      userPasswordError ||
      identityProofError
    ) {
      setErrors({
        name: nameError,
        email: emailError,
        phone: phoneError,
        team_members: teamMembersError,
        years_of_experience: yearsOfExperienceError,
        initial_user: {
          name: userNameError,
          email: userEmailError,
          phone: userPhoneError,
          address: userAddressError,
          age: userAgeError,
          gender: userGenderError,
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
            return await uploadApi.uploadSingle(uploadFile, 'document', response.company.id, {
              document_type: file.documentType,
            });
          });

          const uploadResults = await Promise.all(uploadPromises);
          const failedUploads = uploadResults.filter((result) => !result);

          if (failedUploads.length > 0) {
            showToast.error(
              `${failedUploads.length} file(s) failed to upload. Company created but documents may be missing.`,
            );
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          showToast.warning(
            'Company created but some documents failed to upload. You can add them later.',
          );
        } finally {
          setUploadingFiles(false);
        }
      }

      // Step 3: Upload office photo
      if (officePhoto) {
        setUploadingFiles(true);
        try {
          const uploadFile: UploadFile = {
            uri: officePhoto.uri,
            type: officePhoto.type,
            fileName: officePhoto.fileName,
          };
          const uploadResult = await uploadApi.uploadSingle(uploadFile, 'image', response.company.id);
          if (uploadResult?.url) {
            // Persist the photo URL on the company record
            await companiesApi.update(response.company.id, {
              office_photo_url: uploadResult.url,
            });
          }
        } catch (uploadError: any) {
          console.error('Office photo upload error:', uploadError);
          showToast.warning(
            'Company created but office photo failed to upload. You can add it later.',
          );
        } finally {
          setUploadingFiles(false);
        }
      }

      if (identityProofFiles.length > 0 || officePhoto) {
        showToast.success('Company and files uploaded successfully!');
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

  const handleInputChange = (field: string, value: string | number | undefined) => {
    if (field.startsWith('initial_user.')) {
      const userField = field.replace('initial_user.', '');
      // Handle numeric fields
      if (userField === 'age') {
        const numValue = value === '' || value === undefined ? undefined : (typeof value === 'string' ? parseInt(value, 10) : value);
        setFormData(prev => ({
          ...prev,
          initial_user: {
            ...prev.initial_user,
            [userField]: isNaN(numValue as number) ? undefined : numValue,
          },
        }));
      } else {
      setFormData(prev => ({
        ...prev,
        initial_user: {
          ...prev.initial_user,
          [userField]: value,
        },
      }));
      }
    } else {
      // Handle numeric fields for company
      if (field === 'team_members' || field === 'years_of_experience') {
        const numValue = value === '' || value === undefined ? undefined : (typeof value === 'string' ? parseFloat(value) : value);
        setFormData(prev => ({
          ...prev,
          [field]: isNaN(numValue as number) ? undefined : numValue,
        }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      }
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

  const handleGenderChange = (gender: Gender) => {
    setFormData(prev => ({
      ...prev,
      initial_user: {
        ...prev.initial_user,
        gender,
      },
    }));
    if (errors.initial_user?.gender) {
      setErrors(prev => ({
        ...prev,
        initial_user: {
          ...prev.initial_user,
          gender: undefined,
        },
      }));
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

  const handlePickOfficePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
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
          const asset = response.assets[0];
          setOfficePhoto({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            fileName: asset.fileName || `office_photo_${Date.now()}.jpg`,
          });
          setErrors((prev) => ({ ...prev, officePhoto: undefined }));
        }
      },
    );
  };

  const removeOfficePhoto = () => {
    setOfficePhoto(null);
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

  // Log suggestions state changes
  useEffect(() => {
    console.log('[Company Address] Suggestions state changed:', {
      count: companyAddressSuggestions.length,
      suggestions: companyAddressSuggestions,
      loading: addressLoading,
    });
  }, [companyAddressSuggestions, addressLoading]);

  useEffect(() => {
    console.log('[User Address] Suggestions state changed:', {
      count: userAddressSuggestions.length,
      suggestions: userAddressSuggestions,
      loading: userAddressLoading,
    });
  }, [userAddressSuggestions, userAddressLoading]);

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
              error={errors.phone}
              containerStyle={styles.input}
            />
            <View style={styles.input}>
              <Text style={styles.autocompleteLabel}>Company Address</Text>
              <AutocompleteDropdown
                dataSet={companyAddressSuggestions}
                loading={addressLoading}
                onSelectItem={(item) => {
                  console.log('[Company Address] onSelectItem called with item:', item);
                  const address = item?.title || '';
                  console.log('[Company Address] Selected address:', address);
                  setCompanyAddressSearch(address);
                  handleInputChange('address', address);
                  console.log('[Company Address] Updated formData.address to:', address);
                }}
                onChangeText={(text) => {
                  console.log('[Company Address] onChangeText called with text:', text);
                  console.log('[Company Address] Current suggestions count:', companyAddressSuggestions.length);
                  setCompanyAddressSearch(text);
                  handleInputChange('address', text);
                  fetchCompanyAddressSuggestions(text);
                }}
                textInputProps={{
                  placeholder: 'Search company address',
                  value: companyAddressSearch || formData.address || '',
                  autoCorrect: false,
                  autoCapitalize: 'none',
                  style: {
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingVertical: 10,
                    color: theme.foreground,
                  },
                }}
                inputContainerStyle={styles.autocompleteInputContainer}
                suggestionsListContainerStyle={styles.autocompleteSuggestionsContainer}
                suggestionsListTextStyle={{ color: theme.foreground }}
                debounce={0}
                clearOnFocus={false}
                closeOnBlur={true}
                closeOnSubmit={false}
              />
            </View>
            <Input
              label="Number of Team Members"
              placeholder="Enter number of team members"
              keyboardType="numeric"
              value={formData.team_members?.toString() || ''}
              onChangeText={value => handleInputChange('team_members', value)}
              error={errors.team_members}
              containerStyle={styles.input}
            />
            <Input
              label="Years of Experience"
              placeholder="Enter years of experience"
              keyboardType="numeric"
              value={formData.years_of_experience?.toString() || ''}
              onChangeText={value => handleInputChange('years_of_experience', value)}
              error={errors.years_of_experience}
              containerStyle={styles.input}
            />
            
            <View style={styles.uploadSection}>
              <Text style={styles.uploadSectionLabel}>Company Office Photo</Text>
              {officePhoto ? (
                <View style={styles.officePhotoContainer}>
                  <Image source={{ uri: officePhoto.uri }} style={styles.officePhotoPreview} />
                  <View style={styles.officePhotoActions}>
                    <TouchableOpacity
                      style={styles.officePhotoButton}
                      onPress={handlePickOfficePhoto}
                    >
                      <Icon name="camera" size={20} color={theme.primary} />
                      <Text style={styles.officePhotoButtonText}>Change Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.officePhotoButton}
                      onPress={removeOfficePhoto}
                    >
                      <Icon name="delete" size={20} color={theme.destructive} />
                      <Text style={[styles.officePhotoButtonText, { color: theme.destructive }]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickOfficePhoto}
                >
                  <Icon name="camera" size={20} color={theme.primary} />
                  <Text style={styles.uploadButtonText}>Add Office Photo</Text>
                </TouchableOpacity>
              )}
              {errors.officePhoto && (
                <Text style={styles.errorText}>{errors.officePhoto}</Text>
              )}
            </View>
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
              error={errors.initial_user?.phone}
              containerStyle={styles.input}
            />
            <View style={styles.input}>
              <Text style={styles.autocompleteLabel}>User Address</Text>
              <AutocompleteDropdown
                dataSet={userAddressSuggestions}
                loading={userAddressLoading}
                onSelectItem={(item) => {
                  console.log('[User Address] onSelectItem called with item:', item);
                  const address = item?.title || '';
                  console.log('[User Address] Selected address:', address);
                  setUserAddressSearch(address);
                  handleInputChange('initial_user.address', address);
                  console.log('[User Address] Updated formData.initial_user.address to:', address);
                }}
                onChangeText={(text) => {
                  console.log('[User Address] onChangeText called with text:', text);
                  console.log('[User Address] Current suggestions count:', userAddressSuggestions.length);
                  setUserAddressSearch(text);
                  handleInputChange('initial_user.address', text);
                  fetchUserAddressSuggestions(text);
                }}
                textInputProps={{
                  placeholder: 'Search user address',
                  value: userAddressSearch || formData.initial_user.address || '',
                  autoCorrect: false,
                  autoCapitalize: 'none',
                  style: {
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingVertical: 10,
                    color: theme.foreground,
                  },
                }}
                inputContainerStyle={styles.autocompleteInputContainer}
                suggestionsListContainerStyle={styles.autocompleteSuggestionsContainer}
                suggestionsListTextStyle={{ color: theme.foreground }}
                debounce={0}
                clearOnFocus={false}
                closeOnBlur={true}
                closeOnSubmit={false}
              />
              {errors.initial_user?.address && (
                <Text style={styles.errorText}>{errors.initial_user.address}</Text>
              )}
            </View>
            <Input
              label="User Age"
              placeholder="Enter age"
              keyboardType="numeric"
              value={formData.initial_user.age?.toString() || ''}
              onChangeText={value => handleInputChange('initial_user.age', value)}
              error={errors.initial_user?.age}
              containerStyle={styles.input}
            />
            <GenderPicker
              label="User Gender"
              value={formData.initial_user.gender as Gender | undefined}
              onValueChange={handleGenderChange}
              error={errors.initial_user?.gender}
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
    fontFamily: fonts.sans,
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
    fontFamily: fonts.sans,
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
    fontFamily: fonts.sans,
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
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
    marginBottom: 4,
  },
  fileType: {
    fontFamily: fonts.sans,
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
    fontFamily: fonts.sans,
    fontSize: 12,
    color: theme.destructive,
    marginTop: 4,
  },
  helpText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 8,
    lineHeight: 16,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadSectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
    marginBottom: 8,
  },
  officePhotoContainer: {
    marginTop: 8,
  },
  officePhotoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: theme.muted,
    marginBottom: 12,
  },
  officePhotoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  officePhotoButton: {
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
  officePhotoButtonText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  autocompleteInputContainer: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.card,
  },
  autocompleteSuggestionsContainer: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    marginTop: 4,
  },
  autocompleteLabel: {
    marginBottom: 6,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
  },
});

