import styled from 'styled-components'
import { clsx } from 'clsx'

import { theme } from '~/styles'

import { AvatarGenericProps, Avatar } from './Avatar'
import { Typography } from './Typography'
import { Button } from './Button'
import { Icon, IconName } from './Icon'

import { ConditionalWrapper } from '../ConditionalWrapper'

enum ChipVariantEnum {
  primary = 'primary',
  secondary = 'secondary',
}

enum ChipTypeEnum {
  default = 'default',
  error = 'error',
}

type ChipSize = 'small' | 'medium'
type ChipVariant = keyof typeof ChipVariantEnum

interface ChipGenericProps {
  label: string
  className?: string
  type?: keyof typeof ChipTypeEnum
  onClose?: () => void | Promise<void>
}

interface ChipPropsAvatar extends ChipGenericProps {
  icon?: never
  closeIcon?: IconName
  avatarProps?: Pick<AvatarGenericProps, 'initials' | 'identifier'>
  size?: ChipSize
  variant?: ChipVariant
}

interface ChipPropsIcon extends ChipGenericProps {
  icon: IconName
  closeIcon?: IconName
  avatarProps?: never
  size?: ChipSize
  variant?: ChipVariant
}

type ChipProps = ChipPropsAvatar | ChipPropsIcon

export const Chip = ({
  className,
  label,
  icon,
  closeIcon,
  avatarProps,
  type = ChipTypeEnum.default,
  variant = ChipVariantEnum.primary,
  size = 'small',

  onClose,
}: ChipProps) => {
  return (
    <Container
      className={clsx(
        className,
        `chip-container--${type} chip-container--${variant} chip-container--${size}`
      )}
      data-test={`chip-${label}`}
    >
      {icon && (
        <ConditionalWrapper
          condition={variant === ChipVariantEnum.secondary}
          validWrapper={(children) => (
            <Avatar size="intermediate" variant="connector">
              {children}
            </Avatar>
          )}
          invalidWrapper={(children) => <>{children}</>}
        >
          <Icon
            name={icon}
            size="small"
            color={type === ChipTypeEnum.error ? 'error' : undefined}
          />
        </ConditionalWrapper>
      )}
      {avatarProps && <Avatar size="small" variant="user" {...avatarProps} />}
      <Typography
        variant={variant === ChipVariantEnum.secondary ? 'body' : 'captionHl'}
        color={type === ChipTypeEnum.error ? 'danger600' : 'textSecondary'}
      >
        {label}
      </Typography>
      {onClose && (
        <Button
          size="small"
          variant="quaternary"
          danger={type === ChipTypeEnum.error}
          icon={!!closeIcon ? closeIcon : 'close-circle-filled'}
          onClick={onClose}
        />
      )}
    </Container>
  )
}

const Container = styled.div`
  min-height: 32px;
  height: fit-content;
  border: 1px solid ${theme.palette.grey[300]};
  background-color: ${theme.palette.grey[100]};
  padding: ${theme.spacing(1)} ${theme.spacing(2)};
  box-sizing: border-box;
  border-radius: 8px;
  display: flex;
  align-items: center;
  width: fit-content;
  gap: ${theme.spacing(2)};

  /* Variant */
  &.chip-container--${ChipVariantEnum.secondary} {
    background-color: ${theme.palette.common.white};
    color: ${theme.palette.grey[600]};
    border-color: ${theme.palette.grey[400]};
  }

  /* Size */
  &.chip-container--medium {
    padding: 10px ${theme.spacing(3)};
  }

  /* Type */
  &.chip-container--${ChipTypeEnum.error} {
    background-color: ${theme.palette.error[100]};
    color: ${theme.palette.error[300]};
    border-color: ${theme.palette.error[300]};
  }
`
