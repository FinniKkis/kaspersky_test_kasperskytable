// GroupsPage.jsx
/**
 * GroupsPage — страница групп пользователей.
 * UI сгенерирован с помощью LLM в едином стиле с UsersPage и WelcomePage.
 */
import { useMemo, useState } from 'react';
import { useUsers, useGroups } from '../hooks/useApi';
import styles from './GroupsPage.module.css';

// Иконки для групп (можно расширить)
const GROUP_ICONS = {
  Руководство:  '👑',
  Бухгалтерия:  '💼',
  'Отдел кадров': '🧑‍💼',
  Разработка:   '💻',
  Маркетинг:    '📣',
  Продажи:      '🤝',
  Поддержка:    '🎧',
};

// Набор цветов для карточек (мягкие тона, контрастный акцент)
const GROUP_COLORS = [
  { bg: '#f0fdf4', accent: '#10b981', text: '#065f46' },   // зелёный
  { bg: '#eff6ff', accent: '#3b82f6', text: '#1e3a8a' },   // синий
  { bg: '#fef2f2', accent: '#ef4444', text: '#991b1b' },   // красный
  { bg: '#fffbeb', accent: '#f59e0b', text: '#92400e' },   // янтарный
  { bg: '#f3e8ff', accent: '#a855f7', text: '#4c1d95' },   // фиолетовый
  { bg: '#fce7f3', accent: '#ec4899', text: '#9d174d' },   // розовый
  { bg: '#e0f2fe', accent: '#0ea5e9', text: '#0c4a6e' },   // голубой
];

export default function GroupsPage() {
  const { users, loading: usersLoading } = useUsers();
  const { groups, loading: groupsLoading } = useGroups();
  const [searchQuery, setSearchQuery] = useState('');

  // Группировка пользователей по группам + нераспределённые
  const grouped = useMemo(() => {
    if (!groups.length) return { groups: [], ungrouped: [] };
    const map = Object.fromEntries(groups.map(g => [g.id, { ...g, members: [] }]));
    const ungrouped = [];
    users.forEach(u => {
      if (u.groupId && map[u.groupId]) map[u.groupId].members.push(u);
      else ungrouped.push(u);
    });
    return { groups: Object.values(map), ungrouped };
  }, [users, groups]);

  // Фильтрация групп по названию
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return grouped.groups;
    const q = searchQuery.toLowerCase();
    return grouped.groups.filter(g => g.name.toLowerCase().includes(q));
  }, [grouped.groups, searchQuery]);

  // Подсчёты для статистики
  const totalUsers = users.length;
  const totalGroups = groups.length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  if (usersLoading || groupsLoading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Верхняя панель: заголовок + поиск ── */}
      <div className={styles.toolbar}>
        <div className={styles.titleSection}>
          <div className={styles.stats}>
            <span className={styles.stat}>{totalGroups} отделов</span>
            <span className={styles.stat}>{totalUsers} сотрудников</span>
            <span className={styles.stat}>{activeUsers} активных</span>
          </div>
        </div>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.search}
            placeholder="Поиск по названию отдела..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Сетка карточек групп ── */}
      {filteredGroups.length === 0 ? (
        <div className={styles.empty}>Отделы не найдены</div>
      ) : (
        <div className={styles.grid}>
          {filteredGroups.map((group, idx) => {
            const color = GROUP_COLORS[idx % GROUP_COLORS.length];
            const icon = GROUP_ICONS[group.name] || '🏢';
            const members = group.members || [];
            const activeCount = members.filter(m => m.status === 'active').length;
            const activePercent = members.length ? Math.round((activeCount / members.length) * 100) : 0;

            return (
              <div key={group.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ backgroundColor: color.bg, color: color.accent }}>
                    {icon}
                  </div>
                  <div className={styles.cardMeta}>
                    <h3 className={styles.cardTitle}>{group.name}</h3>
                    <p className={styles.cardDesc}>{group.description || 'Нет описания'}</p>
                  </div>
                  <div className={styles.cardCount} style={{ backgroundColor: color.bg, color: color.text }}>
                    {members.length}
                  </div>
                </div>

                {/* Прогресс активности */}
                <div className={styles.progressWrap}>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressLabel}>Активность</span>
                    <span className={styles.progressPct}>{activePercent}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${activePercent}%`, backgroundColor: 'var(--primary)' }}
                    />
                  </div>
                </div>

                {/* Список участников */}
                <div className={styles.members}>
                  {members.length === 0 ? (
                    <p className={styles.noMembers}>Нет сотрудников в отделе</p>
                  ) : (
                    members.map(member => (
                      <div key={member.id} className={styles.member}>
                        <div
                          className={styles.memberAvatar}
                          style={{ backgroundColor: color.bg, color: color.accent }}
                        >
                          {member.name[0]}
                        </div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>{member.name}</span>
                          <span className={styles.memberRole}>{member.role}</span>
                        </div>
                        <span className={member.status === 'active' ? styles.dotActive : styles.dotInactive} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Сотрудники без отдела ── */}
      {grouped.ungrouped.length > 0 && (
        <div className={styles.ungroupedSection}>
          <div className={styles.ungroupedHeader}>
            <span className={styles.ungroupedIcon}>📋</span>
            <div>
              <h3>Сотрудники без отдела</h3>
              <p>{grouped.ungrouped.length} чел.</p>
            </div>
          </div>
          <div className={styles.ungroupedList}>
            {grouped.ungrouped.map(user => (
              <div key={user.id} className={styles.ungroupedItem}>
                <div className={styles.avatarSmall} style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                  {user.name[0]}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{user.name}</span>
                  <span className={styles.memberRole}>{user.role}</span>
                </div>
                <span className={user.status === 'active' ? styles.dotActive : styles.dotInactive} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}