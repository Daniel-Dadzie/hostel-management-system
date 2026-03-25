# Admin UI Enhancement Guide

This document describes all the new components and utilities added to enhance the admin UI.

## New Components

### 1. DataTable
**Location:** `src/components/admin/DataTable.jsx`

A flexible, feature-rich table component with built-in sorting, pagination, and responsive design.

**Features:**
- ✅ Sortable columns
- ✅ Pagination with configurable items per page
- ✅ Mobile-responsive card view
- ✅ Custom cell rendering
- ✅ Action buttons for each row

**Usage:**
```jsx
import DataTable from '@/components/admin/DataTable.jsx';

<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <span className="badge">{value}</span>
    }
  ]}
  data={students}
  itemsPerPage={15}
  onRowClick={(row) => console.log(row)}
  actions={[
    { label: 'Edit', onClick: (row) => handleEdit(row) }
  ]}
/>
```

### 2. Modal
**Location:** `src/components/admin/Modal.jsx`

A modern modal dialog component with customizable actions and sizes.

**Features:**
- ✅ Multiple size options (sm, md, lg, xl)
- ✅ Customizable action buttons
- ✅ Backdrop dismiss
- ✅ Dark mode support
- ✅ Loading states

**Usage:**
```jsx
import Modal from '@/components/admin/Modal.jsx';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  actions={[
    { label: 'Cancel', onClick: onClose, variant: 'ghost' },
    { label: 'Confirm', onClick: handleConfirm, variant: 'primary' }
  ]}
>
  <p>Are you sure?</p>
</Modal>
```

### 3. Alert
**Location:** `src/components/admin/Alert.jsx`

Status alert component for displaying messages and form errors.

**Features:**
- ✅ Multiple types (success, error, warning, info)
- ✅ Auto-dismiss option
- ✅ Closeable
- ✅ FormError helper for form validation

**Usage:**
```jsx
import Alert, { FormError } from '@/components/admin/Alert.jsx';

<Alert 
  type="success" 
  message="Payment confirmed" 
  autoClose={3000}
/>

<FormError error={errors.email} field="Email" />
```

### 4. AdvancedFilter
**Location:** `src/components/admin/AdvancedFilter.jsx`

Dropdown filter panel with multiple filter type support.

**Features:**
- ✅ Text, select, checkbox, and range filters
- ✅ Active filter counter
- ✅ Collapsible UI
- ✅ Reset capability

**Usage:**
```jsx
import AdvancedFilter from '@/components/admin/AdvancedFilter.jsx';

<AdvancedFilter
  filters={[
    { key: 'status', label: 'Status', type: 'select', 
      options: [{ value: 'ACTIVE', label: 'Active' }] },
    { key: 'search', label: 'Name', type: 'text' }
  ]}
  values={filterValues}
  onChange={setFilterValues}
  onReset={() => setFilterValues({})}
/>
```

### 5. StatsCard & MiniStatsCard
**Location:** `src/components/admin/StatsCard.jsx`

Enhanced metric display cards with optional trends.

**Features:**
- ✅ Gradient backgrounds
- ✅ Trend indicators
- ✅ Icon support
- ✅ Multiple sizes

**Usage:**
```jsx
import { StatsCard, MiniStatsCard } from '@/components/admin/StatsCard.jsx';

<StatsCard
  label="Total Users"
  value="1,234"
  subtext="+15% from last month"
  trend={15}
  icon={FaUsers}
/>

<MiniStatsCard
  label="Active Sessions"
  value="45"
  color="emerald"
/>
```

### 6. StatsSummary & MetricCard
**Location:** `src/components/admin/StatsSummary.jsx`

Quick stat summary rows and comparison metrics.

**Features:**
- ✅ Inline stats display
- ✅ Variant styling
- ✅ Comparison values
- ✅ Icon support

**Usage:**
```jsx
import { StatsSummary, MetricCard } from '@/components/admin/StatsSummary.jsx';

<StatsSummary
  stats={[
    { label: 'Total', value: '100', icon: FaUsers },
    { label: 'Active', value: '85', icon: FaCheckCircle }
  ]}
/>

<MetricCard
  label="Occupancy Rate"
  value="85%"
  trend={5}
  variant="success"
/>
```

### 7. FormField & Validation
**Location:** `src/components/admin/FormField.jsx`

Comprehensive form field component with built-in validation.

**Features:**
- ✅ Multiple input types
- ✅ Integrated error display
- ✅ Required field indicator
- ✅ Help text support
- ✅ Validation utilities

**Usage:**
```jsx
import { FormField, validateForm, ValidationRules } from '@/components/admin/FormField.jsx';

// In component
const [formData, setFormData] = useState({ email: '', password: '' });
const [errors, setErrors] = useState({});

const rules = {
  email: ValidationRules.email,
  password: [
    ValidationRules.required,
    ValidationRules.minLength(8)
  ]
};

const handleSubmit = () => {
  const newErrors = validateForm(formData, rules);
  if (Object.keys(newErrors).length === 0) {
    // Form is valid
  }
  setErrors(newErrors);
};

<FormField
  label="Email"
  name="email"
  type="email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  error={errors}
  required
/>
```

### 8. Loading States
**Location:** `src/components/admin/Skeleton.jsx`

Skeleton loaders and loading spinners for better UX.

**Features:**
- ✅ Card skeleton
- ✅ Table skeleton
- ✅ Loading spinner
- ✅ Customizable sizes

**Usage:**
```jsx
import { SkeletonCard, SkeletonTable, LoadingSpinner } from '@/components/admin/Skeleton.jsx';

{loading ? <SkeletonTable rows={5} /> : <DataTable data={data} />}
{loading && <LoadingSpinner message="Loading..." />}
```

### 9. Breadcrumb Navigation
**Location:** `src/components/admin/Breadcrumb.jsx`

Breadcrumb component for page navigation context.

**Features:**
- ✅ Automatic path detection
- ✅ Customizable labels
- ✅ Home icon
- ✅ Responsive design

**Usage:**
```jsx
import Breadcrumb from '@/components/admin/Breadcrumb.jsx';

<Breadcrumb />
```

## Export Utilities

**Location:** `src/utils/exportUtils.js`

Collection of data export and reporting functions.

**Available Functions:**

### exportToCSV(data, columns, filename)
Export data as CSV file.

### exportToJSON(data, filename)
Export data as JSON file.

### exportToExcel(data, columns, filename)
Export data in Excel format (via CSV).

### printData(data, columns, title)
Open print dialog with formatted data table.

### generateAnalytics(data, groupBy, metrics)
Generate analytics summary from data.

**Usage:**
```jsx
import { exportToCSV, generateAnalytics } from '@/utils/exportUtils.js';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' }
];

exportToCSV(students, columns, 'students.csv');

const analytics = generateAnalytics(
  payments,
  'status',
  [{ field: 'amount', type: 'sum' }]
);
```

## Enhanced Pages

### ManageStudentsPage
- ✅ Stats cards showing key metrics
- ✅ Enhanced search with DataTable
- ✅ CSV and JSON export
- ✅ Better error handling
- ✅ Success notifications
- ✅ Responsive design

### ManagePaymentsPage
- ✅ Payment statistics cards
- ✅ Status-based filtering
- ✅ Improved table UI
- ✅ CSV export functionality
- ✅ Enhanced receipt handling
- ✅ Mobile card view

## Best Practices

### 1. Form Validation
Always use the provided validation utilities for consistent error handling:
```jsx
const rules = {
  email: ValidationRules.email,
  password: [ValidationRules.required, ValidationRules.minLength(8)],
  confirmPassword: ValidationRules.match('Password', formData.password)
};
```

### 2. Loading States
Use skeleton components instead of spinners for better UX:
```jsx
{loading ? <SkeletonTable /> : <DataTable data={data} />}
```

### 3. Error Handling
Display user-friendly error messages:
```jsx
<Alert 
  type="error" 
  message={error.message || 'Something went wrong'} 
  onClose={() => setError(null)}
/>
```

### 4. Data Pagination
Always use DataTable for large datasets:
```jsx
<DataTable data={largeDataset} itemsPerPage={20} />
```

### 5. Mobile First
Ensure all components have mobile views. DataTable automatically handles this.

## Dark Mode

All new components fully support dark mode through Tailwind's `dark:` prefix. The theme is controlled by the system theme toggle.

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader friendly

## Migration Guide

To update existing pages to use new components:

1. **Replace manual tables with DataTable**
   ```jsx
   // Old
   <table>...</table>
   
   // New
   <DataTable columns={[...]} data={data} />
   ```

2. **Use FormField for forms**
   ```jsx
   // Old
   <input type="text" />
   
   // New
   <FormField label="Name" name="name" value={name} onChange={...} />
   ```

3. **Add stats cards**
   ```jsx
   <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
     <MiniStatsCard label="Total" value={count} />
   </div>
   ```

4. **Add export functionality**
   ```jsx
   <button onClick={() => exportToCSV(data, columns, 'export.csv')}>
     Export
   </button>
   ```

## Future Enhancements

- [ ] Advanced charting with Chart.js/Recharts
- [ ] Data visualization components
- [ ] Bulk actions support
- [ ] Advanced filtering with builder UI
- [ ] Inline editing in tables
- [ ] Drag & drop file upload
- [ ] Rich text editor
- [ ] Calendar/date range picker
