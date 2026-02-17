import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { companiesApi, Company, GetCompaniesParams } from '../services/api/companies';
import { showToast } from '../utils/toast';

type FilterStatus = 'all' | 'active' | 'inactive';

export default function CompanyHistoryScreen() {
  const navigation = useNavigation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  const loadCompanies = useCallback(
    async (pageNum: number = 1, reset: boolean = false, isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          // Don't set loading state during refresh to avoid UI flicker
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: GetCompaniesParams = {
          page: pageNum,
          limit,
          search: searchQuery.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        };

        const response = await companiesApi.getAll(params);

        if (response) {
          if (reset || pageNum === 1) {
            setCompanies(response.companies);
          } else {
            setCompanies((prev) => [...prev, ...response.companies]);
          }
          setTotal(response.total);
          setPage(pageNum);
          setHasMore(response.companies.length === limit && response.companies.length > 0);
        } else {
          // No data returned but no error - reset to empty state
          if (reset || pageNum === 1) {
            setCompanies([]);
            setTotal(0);
          }
        }
      } catch (error: any) {
        console.error('[CompanyHistoryScreen] Error loading companies:', error);
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          error?.code === 'NOT_FOUND'
            ? 'Companies endpoint not found. Please check server configuration.'
            : 'Failed to load companies';
        showToast.error(errorMessage);
        
        // Reset state on error for first page load
        if (pageNum === 1) {
          setCompanies([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [searchQuery, statusFilter],
  );

  useEffect(() => {
    loadCompanies(1, true);
  }, [searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => {
    loadCompanies(1, true, true);
  }, [loadCompanies]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadCompanies(page + 1, false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const handleStatusFilter = (status: FilterStatus) => {
    setStatusFilter(status);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? theme.success : theme.mutedForeground;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 'check-circle' : 'close-circle';
  };

  if (loading && companies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>History</Text>
            <Text style={styles.headerSubtitle}>Manage your companies</Text>
          </View>
        </View>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChangeText={handleSearch}
              leftIcon={<Icon name="magnify" size={20} color={theme.mutedForeground} />}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              (searchQuery || statusFilter !== 'all') && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon
              name={showFilters ? 'filter-remove' : 'filter'}
              size={22}
              color={showFilters || searchQuery || statusFilter !== 'all' ? theme.primary : theme.foreground}
            />
          </TouchableOpacity>
        </View>

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterRow}>
              <View style={styles.filterLabelContainer}>
                <Icon name="filter-variant" size={16} color={theme.primary} />
                <Text style={styles.filterLabel}>Filter by Status</Text>
              </View>
              <View style={styles.filterOptions}>
                {(['all', 'active', 'inactive'] as FilterStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      statusFilter === status && styles.filterChipActive,
                    ]}
                    onPress={() => handleStatusFilter(status)}
                  >
                    {statusFilter === status && (
                      <Icon
                        name="check"
                        size={14}
                        color={theme.primaryForeground}
                        style={styles.filterChipIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === status && styles.filterChipTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {(searchQuery || statusFilter !== 'all') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Icon name="close-circle" size={18} color={theme.mutedForeground} />
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results Count */}
        {total > 0 && (
          <View style={styles.resultsHeader}>
            <View style={styles.resultsContainer}>
              <Icon name="briefcase-outline" size={16} color={theme.primary} />
              <Text style={styles.resultsText}>
                {total} {total === 1 ? 'company' : 'companies'} found
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Companies List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.card}
          />
        }
        onScrollEndDrag={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {companies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="office-building-outline" size={80} color={theme.mutedForeground} />
            </View>
            <Text style={styles.emptyText}>No companies found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by onboarding a new company'}
            </Text>
          </View>
        ) : (
          <>
            {companies.map((company) => (
              <TouchableOpacity
                key={company.id}
                activeOpacity={0.7}
                onPress={() => {
                  (navigation as any).navigate('CompanyDetails', {
                    data: {
                      company: company,
                      // For existing companies, we don't have initial_user data
                      isExistingCompany: true,
                    },
                  });
                }}
              >
                <Card style={styles.companyCard}>
                <CardHeader>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardHeaderContent}>
                      <Icon
                        name="office-building"
                        size={24}
                        color={theme.primary}
                      />
                      <CardTitle style={styles.companyName} numberOfLines={2} ellipsizeMode="tail">
                        {company.name}
                      </CardTitle>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        company.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          company.is_active ? styles.statusDotActive : styles.statusDotInactive,
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          company.is_active ? styles.statusTextActive : styles.statusTextInactive,
                        ]}
                      >
                        {company.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                </CardHeader>
                <CardContent>
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="email-outline" size={18} color={theme.primary} />
                      </View>
                      <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                        {company.email}
                      </Text>
                    </View>
                    {company.phone && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="phone-outline" size={18} color={theme.primary} />
                        </View>
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                          {company.phone}
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="calendar-outline" size={18} color={theme.primary} />
                      </View>
                      <Text style={styles.detailText}>
                        Created {formatDate(company.created_at)}
                      </Text>
                    </View>
                    {company.address && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="map-marker-outline" size={18} color={theme.primary} />
                        </View>
                        <Text style={styles.detailText} numberOfLines={2}>
                          {company.address}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Statistics */}
                  {(company.propertiesCount !== undefined || 
                    company.customersCount !== undefined || 
                    company.usersCount !== undefined) && (
                    <View style={styles.statsContainer}>
                      {company.propertiesCount !== undefined && (
                        <View style={styles.statItem}>
                          <Icon name="home" size={14} color={theme.primary} />
                          <Text style={styles.statText}>{company.propertiesCount}</Text>
                          <Text style={styles.statLabel}>Properties</Text>
                        </View>
                      )}
                      {company.customersCount !== undefined && (
                        <View style={styles.statItem}>
                          <Icon name="account-group" size={14} color={theme.primary} />
                          <Text style={styles.statText}>{company.customersCount}</Text>
                          <Text style={styles.statLabel}>Customers</Text>
                        </View>
                      )}
                      {company.usersCount !== undefined && (
                        <View style={styles.statItem}>
                          <Icon name="account" size={14} color={theme.primary} />
                          <Text style={styles.statText}>{company.usersCount}</Text>
                          <Text style={styles.statLabel}>Users</Text>
                        </View>
                      )}
                    </View>
                  )}
                </CardContent>
              </Card>
              </TouchableOpacity>
            ))}

            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            )}

            {!hasMore && companies.length > 0 && (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>No more companies to load</Text>
              </View>
            )}
          </>
        )}
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
    backgroundColor: theme.card,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.foreground,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    fontWeight: '400',
  },
  searchSection: {
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.muted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonActive: {
    backgroundColor: `${theme.primary}20`,
    borderColor: theme.primary,
  },
  filterPanel: {
    marginTop: 12,
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.foreground,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.muted,
    borderWidth: 1.5,
    borderColor: theme.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipIcon: {
    marginRight: -2,
  },
  filterChipText: {
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.primaryForeground,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  clearFiltersText: {
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsText: {
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  companyCard: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeActive: {
    backgroundColor: `${theme.success}15`,
    borderWidth: 1,
    borderColor: `${theme.success}40`,
  },
  statusBadgeInactive: {
    backgroundColor: `${theme.mutedForeground}15`,
    borderWidth: 1,
    borderColor: `${theme.mutedForeground}30`,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: theme.success,
  },
  statusDotInactive: {
    backgroundColor: theme.mutedForeground,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: theme.success,
  },
  statusTextInactive: {
    color: theme.mutedForeground,
  },
  detailsSection: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    minHeight: 24,
  },
  detailIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 22,
    fontWeight: '400',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: theme.border,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadMoreText: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  endContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  endText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: theme.muted,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.foreground,
  },
  statLabel: {
    fontSize: 11,
    color: theme.mutedForeground,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

