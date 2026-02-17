import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { theme } from '../theme/colors';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { companiesApi, Company, UpdateCompanyRequest } from '../services/api/companies';
import { getNameError, getEmailError, getPhoneError } from '../utils/validation';
import { showToast } from '../utils/toast';
import { uploadApi, UploadFile } from '../services/api/upload';
import GenderPicker, { Gender } from '../components/ui/GenderPicker';
import DocumentTypePicker, { DocumentType } from '../components/ui/DocumentTypePicker';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBEx5pLE46IyorCWTQ9CizWEpu4e8hP5NQ';

export default function EditCompanyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { companyId, company: initialCompany } = (route.params as any) || {};

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<UpdateCompanyRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    team_members: undefined,
    years_of_experience: undefined,
    office_photo_url: undefined,
    is_active: true,
  });
  const [officePhoto, setOfficePhoto] = useState<{
    uri: string;
    type: string;
    fileName: string;
  } | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{
    name: string;
    email: string;
    phone?: string;
    address?: string;
    age?: number;
    gender?: string;
  }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    age: undefined,
    gender: undefined,
  });

  // Identity proof documents
  const [documentType, setDocumentType] = useState<DocumentType | undefined>();
  const [existingDocuments, setExistingDocuments] = useState<
    Array<{
      id: string;
      url: string;
      thumbnail_url?: string;
      mime_type: string;
      document_type?: string;
      created_at: string;
    }>
  >([]);
  const [newIdentityFiles, setNewIdentityFiles] = useState<
    Array<{
      uri: string;
      type: string;
      fileName: string;
      documentType: DocumentType;
    }>
  >([]);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    team_members?: string;
    years_of_experience?: string;
    officePhoto?: string;
    adminUser?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      age?: string;
      gender?: string;
    };
    identityProof?: string;
  }>({});

  // Company address autocomplete
  const [companyAddressSearch, setCompanyAddressSearch] = useState('');
  const [companyAddressSuggestions, setCompanyAddressSuggestions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Admin user address autocomplete
  const [userAddressSearch, setUserAddressSearch] = useState('');
  const [userAddressSuggestions, setUserAddressSuggestions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [userAddressLoading, setUserAddressLoading] = useState(false);
  const userAddressSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialCompany) {
      setFormData({
        name: initialCompany.name || '',
        email: initialCompany.email || '',
        phone: initialCompany.phone || '',
        address: initialCompany.address || '',
        team_members: initialCompany.team_members,
        years_of_experience: initialCompany.years_of_experience,
        office_photo_url: initialCompany.office_photo_url,
        is_active: initialCompany.is_active ?? true,
      });
      setCompanyAddressSearch(initialCompany.address || '');
      const initialAdminAddress =
        (initialCompany as any)?.users?.find?.((u: any) => u.role === 'admin')?.address ||
        (initialCompany as any)?.users?.[0]?.address ||
        '';
      if (initialAdminAddress) {
        setUserAddressSearch(initialAdminAddress);
      }
    }
    // Always load full details (users + documents) when we have companyId
    if (companyId) {
      loadCompany();
    }
  }, [companyId, initialCompany]);

  // Ensure dropdown text shows loaded values
  useEffect(() => {
    if (!companyAddressSearch && formData.address) {
      setCompanyAddressSearch(formData.address);
    }
  }, [companyAddressSearch, formData.address]);

  useEffect(() => {
    if (!userAddressSearch && adminUser.address) {
      setUserAddressSearch(adminUser.address);
    }
  }, [userAddressSearch, adminUser.address]);

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

  const loadCompany = async () => {
    if (!companyId) return;

    setFetching(true);
    try {
      const company = await companiesApi.getDetails(companyId);
      if (company) {
        setFormData({
          name: company.name || '',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          team_members: company.team_members,
          years_of_experience: company.years_of_experience,
          office_photo_url: company.office_photo_url,
          is_active: company.is_active ?? true,
        });
        setCompanyAddressSearch(company.address || '');

        // Admin user (prefer role=admin)
        const users = company.users || [];
        const admin = users.find(u => u.role === 'admin') || users[0];
        if (admin) {
          setAdminUserId(admin.id);
          setAdminUser({
            name: admin.name || '',
            email: admin.email || '',
            phone: admin.phone || '',
            address: admin.address || '',
            age: admin.age,
            gender: admin.gender,
          });
          setUserAddressSearch(admin.address || '');
        }

        const docs =
          (company.documents || []).map(d => ({
            id: d.id,
            url: d.url,
            thumbnail_url: d.thumbnail_url ?? undefined,
            mime_type: d.mime_type,
            document_type: d.document_type,
            created_at: d.created_at,
          })) || [];

        setExistingDocuments(docs);

        // Pre-select document type based on the first existing document (if any)
        if (docs.length > 0) {
          if (docs[0].document_type) {
            setDocumentType(docs[0].document_type as DocumentType);
          } else {
            // Backend sometimes returns null; still show a selected value in UI
            setDocumentType('Other');
          }
        }
      } else {
        showToast.error('Company not found');
      }
    } catch (error: any) {
      console.error('Load company error:', error);
      const errorMessage =
        error?.error?.message || error?.message || 'Failed to load company';
      showToast.error(errorMessage);
    } finally {
      setFetching(false);
    }
  };

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
      )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode&components=country:in`;
      
      console.log('[Company Address] Making API request:', apiUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'));
      
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
      )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode&components=country:in`;
      
      console.log('[User Address] Making API request:', apiUrl.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'));
      
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
      name: formData.name?.trim() || '',
      email: formData.email?.trim() || '',
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
    };

    // Validation
    const nameError = getNameError(trimmedFormData.name);
    const emailError = getEmailError(trimmedFormData.email);
    const phoneError = getPhoneError(trimmedFormData.phone || '');

    if (nameError || emailError || phoneError) {
      setErrors({
        name: nameError,
        email: emailError,
        phone: phoneError,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Upload office photo if changed
      let officePhotoUrl = trimmedFormData.office_photo_url;
      if (officePhoto) {
        const uploadFile: UploadFile = {
          uri: officePhoto.uri,
          type: officePhoto.type,
          fileName: officePhoto.fileName,
        };
        const uploadResult = await uploadApi.uploadSingle(
          uploadFile,
          'image',
          companyId || initialCompany?.id,
        );
        if (uploadResult?.url) {
          officePhotoUrl = uploadResult.url;
        }
      }

      const updateData: UpdateCompanyRequest = {
        name: trimmedFormData.name,
        email: trimmedFormData.email,
        phone: trimmedFormData.phone || undefined,
        address: trimmedFormData.address || undefined,
        team_members: trimmedFormData.team_members,
        years_of_experience: trimmedFormData.years_of_experience,
        office_photo_url: officePhotoUrl,
        is_active: formData.is_active,
      };

      const response = await companiesApi.update(companyId || initialCompany?.id, updateData);
      if (!response) {
        throw new Error('Failed to update company');
      }

      // Update admin user fields (if available)
      if (adminUserId && (companyId || initialCompany?.id)) {
        await companiesApi.updateCompanyUser(companyId || initialCompany?.id, adminUserId, {
          name: adminUser.name?.trim(),
          email: adminUser.email?.trim(),
          phone: adminUser.phone?.trim() || undefined,
          address: adminUser.address?.trim() || undefined,
          age: adminUser.age,
          gender: adminUser.gender,
        });
      }

      // Upload new identity proof documents
      if (newIdentityFiles.length > 0) {
        await Promise.all(
          newIdentityFiles.map(async (file) => {
            const uploadFile: UploadFile = {
              uri: file.uri,
              type: file.type,
              fileName: file.fileName,
            };
            return uploadApi.uploadSingle(
              uploadFile,
              'document',
              companyId || initialCompany?.id,
              { document_type: file.documentType },
            );
          }),
        );
      }

      showToast.success('Company updated successfully!');
      // Navigate back to History listing screen
      (navigation as any).navigate('Main', {
        screen: 'CompanyHistory',
      });
    } catch (error: any) {
      console.error('Update company error:', error);

      // Handle API validation errors
      if (error.response?.data?.error || error.error) {
        const apiError = error.response?.data?.error || error.error;
        const errorCode = apiError.code;
        const errorMessage = apiError.message;

        if (errorCode === 'VALIDATION_ERROR') {
          if (errorMessage.includes('email')) {
            setErrors(prev => ({ ...prev, email: 'Email is invalid or already exists' }));
          } else if (errorMessage.includes('name')) {
            setErrors(prev => ({ ...prev, name: 'Company name is required' }));
          } else {
            showToast.error(errorMessage);
          }
        } else if (errorCode === 'DUPLICATE_ENTRY') {
          if (errorMessage.includes('email')) {
            setErrors(prev => ({ ...prev, email: 'Company with this email already exists' }));
          } else {
            showToast.error(errorMessage);
          }
        } else if (errorCode === 'FORBIDDEN') {
          showToast.error('You do not have permission to update this company');
        } else if (errorCode === 'NOT_FOUND') {
          showToast.error('Company not found');
          navigation.goBack();
        } else {
          showToast.error(errorMessage || 'Failed to update company. Please try again.');
        }
      } else {
        const errorMessage = error.message || 'Failed to update company. Please try again.';
        showToast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateCompanyRequest, value: string | boolean) => {
    // numeric fields
    if (field === 'team_members' || field === 'years_of_experience') {
      const str = String(value);
      const num =
        str.trim().length === 0
          ? undefined
          : field === 'team_members'
            ? parseInt(str, 10)
            : parseFloat(str);
      setFormData(prev => ({ ...prev, [field]: isNaN(num as number) ? undefined : (num as any) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value as any }));
    }
    // Clear errors
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePickOfficePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
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
          setErrors(prev => ({ ...prev, officePhoto: undefined }));
        }
      },
    );
  };

  const removeOfficePhoto = () => setOfficePhoto(null);

  const handlePickIdentityPhotos = () => {
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
        if (response.didCancel) return;
        if (response.errorMessage) {
          showToast.error(response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const newFiles = response.assets.map((asset) => ({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
            documentType,
          }));
          setNewIdentityFiles((prev) => [...prev, ...newFiles]);
          setErrors((prev) => ({ ...prev, identityProof: undefined }));
        }
      },
    );
  };

  const removeNewIdentityFile = (index: number) => {
    setNewIdentityFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = async (fileId: string) => {
    try {
      const cid = companyId || initialCompany?.id;
      if (!cid) return;
      await uploadApi.deleteCompanyFile(cid, fileId);
      setExistingDocuments((prev) => prev.filter((d) => d.id !== fileId));
      showToast.success('Document deleted');
    } catch (e: any) {
      showToast.error(e?.message || 'Failed to delete document');
    }
  };

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading company...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Company</Text>
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
              value={formData.name || ''}
              onChangeText={value => handleInputChange('name', value)}
              error={errors.name}
              containerStyle={styles.input}
            />
            <Input
              label="Company Email *"
              placeholder="company@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email || ''}
              onChangeText={value => handleInputChange('email', value)}
              error={errors.email}
              containerStyle={styles.input}
            />
            <Input
              label="Company Phone"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={formData.phone || ''}
              onChangeText={value => handleInputChange('phone', value)}
              error={errors.phone}
              containerStyle={styles.input}
            />
            <View style={styles.input}>
              <Text style={styles.autocompleteLabel}>Company Address</Text>
              <AutocompleteDropdown
                key={`company-address-${companyAddressSearch || formData.address || ''}`}
                dataSet={companyAddressSuggestions}
                loading={addressLoading}
                initialValue={companyAddressSearch || formData.address || ''}
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
                  defaultValue: companyAddressSearch || formData.address || '',
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
              ) : formData.office_photo_url ? (
                <View style={styles.officePhotoContainer}>
                  <Image source={{ uri: formData.office_photo_url }} style={styles.officePhotoPreview} />
                  <View style={styles.officePhotoActions}>
                    <TouchableOpacity
                      style={styles.officePhotoButton}
                      onPress={handlePickOfficePhoto}
                    >
                      <Icon name="camera" size={20} color={theme.primary} />
                      <Text style={styles.officePhotoButtonText}>Change Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickOfficePhoto}>
                  <Icon name="camera" size={20} color={theme.primary} />
                  <Text style={styles.uploadButtonText}>Add Office Photo</Text>
                </TouchableOpacity>
              )}
              {errors.officePhoto && <Text style={styles.errorText}>{errors.officePhoto}</Text>}
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Status</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  formData.is_active ? styles.toggleButtonActive : styles.toggleButtonInactive,
                ]}
                onPress={() => handleInputChange('is_active', !formData.is_active)}
              >
                <View
                  style={[
                    styles.toggleDot,
                    formData.is_active ? styles.toggleDotActive : styles.toggleDotInactive,
                  ]}
                />
                <Text
                  style={[
                    styles.toggleText,
                    formData.is_active ? styles.toggleTextActive : styles.toggleTextInactive,
                  ]}
                >
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
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
              value={adminUser.name}
              onChangeText={(value) => setAdminUser((p) => ({ ...p, name: value }))}
              containerStyle={styles.input}
            />
            <Input
              label="User Email *"
              placeholder="admin@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={adminUser.email}
              onChangeText={(value) => setAdminUser((p) => ({ ...p, email: value }))}
              containerStyle={styles.input}
            />
            <Input
              label="User Phone"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              value={adminUser.phone || ''}
              onChangeText={(value) => setAdminUser((p) => ({ ...p, phone: value }))}
              containerStyle={styles.input}
            />
            <Input
              label="User Address"
              placeholder="Enter user address"
              value={adminUser.address || ''}
              onChangeText={(value) => setAdminUser((p) => ({ ...p, address: value }))}
              multiline
              numberOfLines={3}
              containerStyle={{ display: 'none' }}
            />
            <View style={styles.input}>
              <Text style={styles.autocompleteLabel}>User Address</Text>
              <AutocompleteDropdown
                key={`user-address-${userAddressSearch || adminUser.address || ''}`}
                dataSet={userAddressSuggestions}
                loading={userAddressLoading}
                initialValue={userAddressSearch || adminUser.address || ''}
                onSelectItem={(item) => {
                  console.log('[User Address] onSelectItem called with item:', item);
                  const address = item?.title || '';
                  console.log('[User Address] Selected address:', address);
                  setUserAddressSearch(address);
                  setAdminUser((p) => ({ ...p, address }));
                  console.log('[User Address] Updated adminUser.address to:', address);
                }}
                onChangeText={(text) => {
                  console.log('[User Address] onChangeText called with text:', text);
                  console.log('[User Address] Current suggestions count:', userAddressSuggestions.length);
                  setUserAddressSearch(text);
                  setAdminUser((p) => ({ ...p, address: text }));
                  fetchUserAddressSuggestions(text);
                }}
                textInputProps={{
                  placeholder: 'Search user address',
                  defaultValue: userAddressSearch || adminUser.address || '',
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
              label="User Age"
              placeholder="Enter age"
              keyboardType="numeric"
              value={adminUser.age?.toString() || ''}
              onChangeText={(value) =>
                setAdminUser((p) => ({
                  ...p,
                  age: value.trim().length === 0 ? undefined : parseInt(value, 10),
                }))
              }
              containerStyle={styles.input}
            />
            <GenderPicker
              label="User Gender"
              value={adminUser.gender as Gender | undefined}
              onValueChange={(gender) => setAdminUser((p) => ({ ...p, gender }))}
            />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderContent}>
              <Icon name="card-account-details" size={20} color={theme.primary} />
              <CardTitle>Broker Identity Proof</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <DocumentTypePicker
              label="Document Type"
              value={documentType}
              onValueChange={setDocumentType}
              error={errors.identityProof && !documentType ? errors.identityProof : undefined}
            />

            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickIdentityPhotos}
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
            </View>

            {(existingDocuments.length > 0 || newIdentityFiles.length > 0) && (
              <View style={styles.filesList}>
                <Text style={styles.filesListTitle}>
                  Documents ({existingDocuments.length + newIdentityFiles.length})
                </Text>

                {existingDocuments.map((doc) => (
                  <View key={doc.id} style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Icon name="file-document" size={24} color={theme.primary} />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {doc.document_type || 'Document'}
                        </Text>
                        <Text style={styles.fileType}>{doc.mime_type}</Text>
                      </View>
                    </View>
                    {(doc.thumbnail_url || doc.url) && (
                      <Image
                        source={{ uri: (doc.thumbnail_url || doc.url).trim() }}
                        style={styles.fileThumbnail}
                        resizeMode="cover"
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => removeExistingDocument(doc.id)}
                      style={styles.removeButton}
                    >
                      <Icon name="close-circle" size={24} color={theme.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}

                {newIdentityFiles.map((file, index) => (
                  <View key={`${file.uri}_${index}`} style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Icon name="image" size={24} color={theme.primary} />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.fileName}
                        </Text>
                        <Text style={styles.fileType}>{file.documentType}</Text>
                      </View>
                    </View>
                    {file.uri && (
                      <Image source={{ uri: file.uri }} style={styles.fileThumbnail} />
                    )}
                    <TouchableOpacity
                      onPress={() => removeNewIdentityFile(index)}
                      style={styles.removeButton}
                    >
                      <Icon name="close-circle" size={24} color={theme.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        <Button
          title={loading ? 'Updating...' : 'Update Company'}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.mutedForeground,
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
  uploadSection: {
    marginBottom: 16,
  },
  uploadSectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
    marginBottom: 8,
  },
  uploadButton: {
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
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
  },
  errorText: {
    fontSize: 12,
    color: theme.destructive,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.foreground,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: `${theme.success}15`,
    borderColor: theme.success,
  },
  toggleButtonInactive: {
    backgroundColor: `${theme.mutedForeground}15`,
    borderColor: theme.mutedForeground,
  },
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  toggleDotActive: {
    backgroundColor: theme.success,
  },
  toggleDotInactive: {
    backgroundColor: theme.mutedForeground,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: theme.success,
  },
  toggleTextInactive: {
    color: theme.mutedForeground,
  },
});

