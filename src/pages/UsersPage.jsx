import { useState, useMemo, useEffect, useRef } from 'react'
import { useUsers, useGroups } from '../hooks/useApi'
import styles from './UsersPage.module.css'

// ─── Иконки ────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="black"/>
      <path d="M29 29L24.657 24.657M24.657 24.657C25.3999 23.9142 25.9892 23.0322 26.3913 22.0616C26.7933 21.091 27.0002 20.0507 27.0002 19.0001C27.0002 17.9495 26.7933 16.9092 26.3913 15.9386C25.9892 14.968 25.3999 14.0861 24.657 13.3432C23.9142 12.6003 23.0322 12.011 22.0616 11.609C21.091 11.2069 20.0507 11 19.0001 11C17.9495 11 16.9092 11.2069 15.9386 11.609C14.968 12.011 14.0861 12.6003 13.3432 13.3432C11.8429 14.8435 11 16.8784 11 19.0001C11 21.1219 11.8429 23.1567 13.3432 24.657C14.8435 26.1574 16.8784 27.0002 19.0001 27.0002C21.1219 27.0002 23.1567 26.1574 24.657 24.657Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AddIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#121212"/>
      <path d="M19.4996 30C18.9473 30 18.4996 29.5523 18.4996 29V11C18.4996 10.4477 18.9473 10 19.4996 10H20.4996C21.0519 10 21.4996 10.4477 21.4996 11V29C21.4996 29.5523 21.0519 30 20.4996 30H19.4996ZM11.0001 21.5C10.4478 21.5 10.0001 21.0523 10.0001 20.5V19.5C10.0001 18.9477 10.4478 18.5 11.0001 18.5H29.0003C29.5526 18.5 30.0003 18.9477 30.0003 19.5V20.5C30.0003 21.0523 29.5526 21.5 29.0003 21.5H11.0001Z" fill="white"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1.11111H12L10.8571 0H5.14286L4 1.11111H0V3.33333H16M1.14286 17.7778C1.14286 18.3671 1.38367 18.9324 1.81233 19.3491C2.24098 19.7659 2.82236 20 3.42857 20H12.5714C13.1776 20 13.759 19.7659 14.1877 19.3491C14.6163 18.9324 14.8571 18.3671 14.8571 17.7778V4.44444H1.14286V17.7778Z" fill="#9ca3af"/>
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SortIcon({ dir }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M5 1L1 5H9L5 1Z" fill={dir === 'asc' ? '#121212' : '#d1d5db'}/>
      <path d="M5 13L9 9H1L5 13Z" fill={dir === 'desc' ? '#121212' : '#d1d5db'}/>
    </svg>
  )
}

// ─── Кастомный дропдаун ─────────────────────────────────────────
function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className={styles.dropdown} ref={ref}>
      <button className={styles.dropdownTrigger} onClick={() => setOpen(v => !v)}>
        <span>{selected?.label}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`${styles.dropdownItem} ${opt.value === value ? styles.dropdownItemActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Форма добавления ──────────────────────────────────────────
const EMPTY_FORM = { name: '', email: '', role: '', groupId: '', status: 'active' }

function AddUserModal({ groups, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Введите имя'
    if (!form.email.trim()) e.email = 'Введите email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Неверный формат'
    if (!form.role.trim())  e.role  = 'Введите должность'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ ...form, groupId: form.groupId ? Number(form.groupId) : null })
  }

  const field = (key, label, type = 'text') => (
    <div className={styles.field}>
      <label>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className={errors[key] ? styles.inputErr : ''}
        placeholder={label}
      />
      {errors[key] && <span className={styles.err}>{errors[key]}</span>}
    </div>
  )

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <h2>Новый сотрудник</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {field('name',  'ФИО')}
          {field('email', 'Email', 'email')}
          {field('role',  'Должность')}

          <div className={styles.field}>
            <label>Отдел</label>
            <select value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))}>
              <option value="">— Без отдела —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label>Статус</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Отмена</button>
            <button type="submit" className={styles.btnSave}>Добавить</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const R = 20
const k = 0.5523  

function buildTablePath(w, h) {
  const T  = 70
  const D  = 10
  const y1 = R
  const y2 = y1 + D
  const y3 = y2 + R
  const y4 = y3 + R

  return [
    `M ${R} 0`,
    `H ${w - T}`,
    `C ${w-T+R*k} 0 ${w-T+R} ${R*(1-k)} ${w-T+R} ${y1}`,
    `V ${y2}`,
    `C ${w-T+R} ${y2+R*k} ${w-T+2*R-R*(1-k)} ${y3} ${w-T+2*R} ${y3}`,
    `H ${w - R}`,
    `C ${w-R+R*k} ${y3} ${w} ${y3+R*(1-k)} ${w} ${y4}`,
    `V ${h - R}`,
    `C ${w} ${h-R+R*k} ${w-R*(1-k)} ${h} ${w-R} ${h}`,
    `H ${R}`,
    `C ${R-R*k} ${h} 0 ${h-R*(1-k)} 0 ${h-R}`,
    `V ${R}`,
    `C 0 ${R*(1-k)} ${R*(1-k)} 0 ${R} 0`,
    'Z',
  ].join(' ')
}

export default function UsersPage() {
  const { users, loading, error, addUser, deleteUser } = useUsers()
  const { groups } = useGroups()

  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('all')
  const [filterGroup, setFilterGrp] = useState('all')
  const [sortKey, setSortKey]       = useState(null)
  const [sortDir, setSortDir]       = useState('asc')
  const [showModal, setShowModal]   = useState(false)
  const [deleteId, setDeleteId]     = useState(null)

  const [tableWrapEl, setTableWrapEl] = useState(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!tableWrapEl) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setDims({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(tableWrapEl)
    return () => ro.disconnect()
  }, [tableWrapEl])

  const shapePath = dims.w && dims.h ? buildTablePath(dims.w, dims.h) : null

  useEffect(() => {
    if (tableWrapEl && shapePath) {
      tableWrapEl.style.clipPath = `path('${shapePath}')`
    }
  }, [tableWrapEl, shapePath])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const groupMap = useMemo(
    () => Object.fromEntries(groups.map(g => [g.id, g.name])),
    [groups]
  )

  const statusOptions = [
    { value: 'all',      label: 'Все статусы' },
    { value: 'active',   label: 'Активные'    },
    { value: 'inactive', label: 'Неактивные'  },
  ]

  const groupOptions = useMemo(() => [
    { value: 'all',  label: 'Все отделы' },
    { value: 'none', label: 'Без отдела' },
    ...groups.map(g => ({ value: String(g.id), label: g.name })),
  ], [groups])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const result = users.filter(u => {
      if (filterStatus !== 'all' && u.status !== filterStatus) return false
      if (filterGroup !== 'all') {
        if (filterGroup === 'none' && u.groupId !== null) return false
        if (filterGroup !== 'none' && String(u.groupId) !== filterGroup) return false
      }
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (groupMap[u.groupId] || '').toLowerCase().includes(q)
      )
    })
    if (!sortKey) return result
    return [...result].sort((a, b) => {
      let av = sortKey === 'group' ? (groupMap[a.groupId] || '') : (a[sortKey] ?? '')
      let bv = sortKey === 'group' ? (groupMap[b.groupId] || '') : (b[sortKey] ?? '')
      av = String(av).toLowerCase()
      bv = String(bv).toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [users, search, filterStatus, filterGroup, groupMap, sortKey, sortDir])

  const handleAdd = async (formData) => {
    await addUser(formData)
    setShowModal(false)
  }

  const confirmDelete = (id) => setDeleteId(id)
  const doDelete = async () => {
    await deleteUser(deleteId)
    setDeleteId(null)
  }

  if (loading) return <div className={styles.center}><div className={styles.spinner}/></div>
  if (error)   return <div className={styles.center}><p className={styles.errorMsg}>Ошибка: {error}<br/>Убедитесь, что json-server запущен (<code>npm run server</code>)</p></div>

  return (
    <div className={styles.page}>
      {/* ── Тулбар ── */}
      <div className={styles.toolbar}>
        <button className={styles.searchIconBtn} onClick={() => {}}>
          <SearchIcon />
        </button>
        <div className={styles.searchWrap}>
          <input
            className={styles.search}
            placeholder="Поиск по имени, email, должности..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <Dropdown value={filterStatus} onChange={setFilter}   options={statusOptions} />
        <Dropdown value={filterGroup}  onChange={setFilterGrp} options={groupOptions}  />
      </div>

      {/* ── Таблица ── */}
      <div className={styles.tableOuter}>
        <button className={styles.addBtnFloat} onClick={() => setShowModal(true)} title="Добавить сотрудника">
          <AddIcon />
        </button>

        <div ref={setTableWrapEl} className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headRow}>
                <th className={styles.thNum}>#</th>
                {[
                  { key: 'name',      label: 'ФИО'       },
                  { key: 'email',     label: 'EMAIL'     },
                  { key: 'role',      label: 'ДОЛЖНОСТЬ' },
                  { key: 'group',     label: 'ОТДЕЛ'     },
                  { key: 'status',    label: 'СТАТУС'    },
                  { key: 'createdAt', label: 'ДОБАВЛЕН'  },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className={`${styles.th} ${styles.thSortable} ${sortKey === key ? styles.thActive : ''}`}
                    onClick={() => toggleSort(key)}
                  >
                    {label}
                    <SortIcon dir={sortKey === key ? sortDir : null} />
                  </th>
                ))}
                <th className={styles.thDel}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>Сотрудники не найдены</td>
                </tr>
              ) : filtered.map((u, idx) => (
                <tr key={u.id} className={styles.row}>
                  <td className={styles.tdNum}>{idx + 1}</td>
                  <td className={styles.tdName}>
                    <div className={styles.avatar}>{u.name[0]}</div>
                    <span className={styles.nameText}>{u.name}</span>
                  </td>
                  <td className={styles.tdEmail}>{u.email}</td>
                  <td className={styles.tdRole}>{u.role}</td>
                  <td>
                    {u.groupId
                      ? <span className={styles.groupBadge}>{groupMap[u.groupId] || '—'}</span>
                      : <span className={styles.noGroup}>Без отдела</span>
                    }
                  </td>
                  <td>
                    <span className={u.status === 'active' ? styles.statusOn : styles.statusOff}>
                      {u.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className={styles.tdDate}>{u.createdAt}</td>
                  <td className={styles.tdDel}>
                    <button
                      className={styles.btnDelete}
                      onClick={() => confirmDelete(u.id)}
                      title="Удалить"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shapePath && (
          <svg
            className={styles.tableBorderSvg}
            width={dims.w}
            height={dims.h}
          >
            <path d={shapePath} fill="none" stroke="#121212" strokeWidth="1" />
          </svg>
        )}
      </div>

      {/* ── Модалка добавления ── */}
      {showModal && (
        <AddUserModal
          groups={groups}
          onSave={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Подтверждение удаления ── */}
      {deleteId !== null && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className={styles.modal} style={{ maxWidth: 400 }}>
            <div className={styles.modalHead}>
              <h2>Удалить сотрудника?</h2>
              <button className={styles.closeBtn} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
              Это действие нельзя отменить.
            </p>
            <div className={styles.modalActions} style={{ padding: '0 24px 24px' }}>
              <button className={styles.btnCancel} onClick={() => setDeleteId(null)}>Отмена</button>
              <button className={styles.btnDanger} onClick={doDelete}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
