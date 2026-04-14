import { StyleSheet } from 'react-native'

export const profesionalAgendaStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FC',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6FC',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  headerBlock: {
    paddingTop: 42,
    paddingBottom: 12,
  },
  heroCard: {
    backgroundColor: '#DCEBFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#BFD5F8',
  },
  heroKicker: {
    color: '#1E3A8A',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: 4,
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 4,
    color: '#334155',
    fontSize: 14,
  },
  calendarCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E5F7',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellOutside: {
    opacity: 0.45,
  },
  dayCellSelected: {
    backgroundColor: '#DBEAFE',
  },
  dayNumber: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  dayNumberOutside: {
    color: '#94A3B8',
  },
  dayNumberSelected: {
    color: '#1E3A8A',
  },
  dayNumberToday: {
    color: '#2563EB',
  },
  dotWrap: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  dotCount: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '700',
  },
  dayBlock: {
    marginTop: 14,
    gap: 10,
  },
  dayTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#EEF3FB',
    borderWidth: 1,
    borderColor: '#D9E5F7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardMeta: {
    marginTop: 7,
    color: '#475569',
    fontSize: 13,
  },
  emptyCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 13,
  },
})
