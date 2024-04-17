import { useCallback } from 'react'

import { Permission } from '../../../types/account-settings'
import { PERMISSION_PRIORITY } from '../../../constants'
import { useAccountRbacSettings } from '../../../states/account-settings/hook'

interface RbacGuardProps {
  element: React.ReactElement
  requiredKeys: string[]
  requiredPermission: Permission
}

const RbacGuard: React.FC<RbacGuardProps> = (props) => {
  const rbacSettings = useAccountRbacSettings()

  const shouldRender = useCallback(() => {
    if (!rbacSettings) {
      return false
    }

    if (rbacSettings.isOwner) {
      return true
    }

    return props.requiredKeys
      .map(requiredKey => rbacSettings?.permissions[requiredKey] ?? 'Disable')
      .findIndex(
        existedPermission => PERMISSION_PRIORITY[existedPermission] >= PERMISSION_PRIORITY[props.requiredPermission]
      ) !== -1
  }, [props.requiredKeys, props.requiredPermission, rbacSettings])

  return <>{shouldRender() && props.element}</>
}

export default RbacGuard
