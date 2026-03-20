<script setup lang="ts">
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

await navigateTo('/cliente/servicios/servicios/mis-pedidos', { replace: true })
</script>
