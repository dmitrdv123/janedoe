import { useCallback } from 'react'

import { Permission, PermissionKey } from '../../../types/account-settings'
import { useAccountRbacSettings } from '../../../states/account-settings/hook'
import { hasPermission } from '../../../libs/utils'

interface RbacGuardProps {
  element: React.ReactElement
  requiredKeys: PermissionKey[]
  requiredPermission: Permission
}

const RbacGuard: React.FC<RbacGuardProps> = (props) => {
  const rbacSettings = useAccountRbacSettings()

  const shouldRender = useCallback(() => {
    return hasPermission(rbacSettings, props.requiredKeys, props.requiredPermission)
  }, [props.requiredKeys, props.requiredPermission, rbacSettings])

  return <>{shouldRender() && props.element}</>
}

export default RbacGuard
