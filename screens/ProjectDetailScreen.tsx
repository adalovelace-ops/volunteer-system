import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { getProject, getVolunteer } from '../models/storage';
import { Project, Volunteer } from '../models/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const proj = await getProject(projectId);
        setProject(proj);

        if (proj) {
          const volunteerIds = proj.volunteers || [];
          const resolved = await Promise.all(
            volunteerIds.map((id) => getVolunteer(id))
          );
          setVolunteers(resolved.filter((v): v is Volunteer => v !== null));
        }
      } catch {
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{error || 'Project not found.'}</Text>
      </View>
    );
  }

  const endDate = new Date(project.endDate);
  const isValidEnd = !Number.isNaN(endDate.getTime());

  const renderVolunteerItem = ({ item }: { item: Volunteer }) => (
    <View style={styles.volunteerCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.volunteerInfo}>
        <Text style={styles.volunteerName}>{item.name}</Text>
        <Text style={styles.volunteerSkills}>
          {item.skills.length > 0
            ? item.skills.slice(0, 3).join(', ')
            : 'No skills listed'}
        </Text>
      </View>
      <View style={styles.hoursBadge}>
        <Text style={styles.hoursValue}>{item.totalHoursContributed}h</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={22} color="#166534" />
        <Text style={styles.backLabel}>Back to Projects</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{project.title}</Text>

      <View style={styles.endTimeCard}>
        <View style={styles.endTimeRow}>
          <MaterialIcons name="event" size={22} color="#dc2626" />
          <View style={styles.endTimeInfo}>
            <Text style={styles.endTimeLabel}>Event End Date</Text>
            <Text style={styles.endTimeValue}>
              {isValidEnd
                ? format(endDate, 'MMMM d, yyyy — h:mm a')
                : 'Not specified'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <MaterialIcons name="group" size={20} color="#166534" />
        <Text style={styles.sectionTitle}>
          Volunteers Joined ({volunteers.length})
        </Text>
      </View>

      {volunteers.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="person-add" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            No volunteers have joined this project yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={volunteers}
          keyExtractor={(item) => item.id}
          renderItem={renderVolunteerItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingVertical: 4,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  endTimeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  endTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  endTimeInfo: {
    flex: 1,
  },
  endTimeLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  endTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  listContent: {
    paddingBottom: 20,
  },
  volunteerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  volunteerSkills: {
    fontSize: 12,
    color: '#64748b',
  },
  hoursBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hoursValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
