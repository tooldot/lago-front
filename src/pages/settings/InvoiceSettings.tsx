import { useRef } from 'react'
import styled from 'styled-components'
import { gql } from '@apollo/client'

import {
  Typography,
  Button,
  Skeleton,
  ShowMoreText,
  Avatar,
  Icon,
  Tooltip,
} from '~/components/designSystem'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import ErrorImage from '~/public/images/maneki/error.svg'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import { theme, NAV_HEIGHT } from '~/styles'
import {
  DeleteOrganizationVatRateFragmentDoc,
  EditOrganizationInvoiceTemplateDialogFragmentDoc,
  useGetOrganizationSettingsQuery,
} from '~/generated/graphql'
import {
  AddOrganizationVatRateDialog,
  AddOrganizationVatRateDialogRef,
} from '~/components/settings/AddOrganizationVatRateDialog'
import {
  EditOrganizationInvoiceTemplateDialog,
  EditOrganizationInvoiceTemplateDialogRef,
} from '~/components/settings/EditOrganizationInvoiceTemplateDialog'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { EditOrganizationGracePeriodDialog } from '~/components/settings/EditOrganizationGracePeriodDialog'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { PremiumWarningDialog, PremiumWarningDialogRef } from '~/components/PremiumWarningDialog'
import {
  EditOrganizationDocumentLocaleDialog,
  EditOrganizationDocumentLocaleDialogRef,
} from '~/components/settings/EditOrganizationDocumentLocaleDialog'
import { DocumentLocales } from '~/core/translations/documentLocales'
import {
  DeleteOrganizationVatRateDialog,
  DeleteOrganizationVatRateDialogRef,
} from '~/components/settings/DeleteOrganizationVatRateDialog'

const MAX_FOOTER_LENGTH_DISPLAY_LIMIT = 200

gql`
  query getOrganizationSettings($appliedToOrganization: Boolean = true) {
    organization {
      id
      billingConfiguration {
        id
        invoiceGracePeriod
        invoiceFooter
        documentLocale
      }
      ...EditOrganizationInvoiceTemplateDialog
    }

    taxes(appliedToOrganization: $appliedToOrganization) {
      collection {
        id
        name
        code
        rate

        ...DeleteOrganizationVatRate
      }
    }
  }

  ${DeleteOrganizationVatRateFragmentDoc}
  ${EditOrganizationInvoiceTemplateDialogFragmentDoc}
`

const InvoiceSettings = () => {
  const { translate } = useInternationalization()
  const { isPremium } = useCurrentUser()
  const editVATDialogRef = useRef<AddOrganizationVatRateDialogRef>(null)
  const deleteVATDialogRef = useRef<DeleteOrganizationVatRateDialogRef>(null)
  const editInvoiceTemplateDialogRef = useRef<EditOrganizationInvoiceTemplateDialogRef>(null)
  const editGracePeriodDialogRef = useRef<EditOrganizationInvoiceTemplateDialogRef>(null)
  const editDocumentLanguageDialogRef = useRef<EditOrganizationDocumentLocaleDialogRef>(null)
  const premiumWarningDialogRef = useRef<PremiumWarningDialogRef>(null)
  const { data, error, loading } = useGetOrganizationSettingsQuery()
  const organization = data?.organization
  const appliedTaxRates = data?.taxes?.collection || undefined
  const invoiceFooter = organization?.billingConfiguration?.invoiceFooter || ''
  const invoiceGracePeriod = organization?.billingConfiguration?.invoiceGracePeriod || 0
  const documentLocale = organization?.billingConfiguration?.documentLocale || DocumentLocales.en

  if (!!error && !loading) {
    return (
      <GenericPlaceholder
        title={translate('text_629728388c4d2300e2d380d5')}
        subtitle={translate('text_629728388c4d2300e2d380eb')}
        buttonTitle={translate('text_629728388c4d2300e2d38110')}
        buttonVariant="primary"
        buttonAction={() => location.reload()}
        image={<ErrorImage width="136" height="104" />}
      />
    )
  }

  return (
    <Page>
      <Title variant="headline">{translate('text_62ab2d0396dd6b0361614d24')}</Title>
      <Subtitle>{translate('text_637f819eff19cd55a56d55e2')}</Subtitle>

      <InlineSectionTitle>
        <Typography variant="subhead" color="grey700">
          {translate('text_637f819eff19cd55a56d55e6')}
        </Typography>
        <Button
          variant="quaternary"
          disabled={loading}
          onClick={editVATDialogRef?.current?.openDialog}
        >
          {translate('text_645bb193927b375079d28ad2')}
        </Button>
      </InlineSectionTitle>

      <InfoBlock $loading={loading}>
        {loading ? (
          <>
            <Skeleton variant="text" width={320} height={12} />
            <Skeleton variant="text" width={160} height={12} />
          </>
        ) : (
          <>
            <Typography variant="body" color="grey700">
              {!!appliedTaxRates?.length ? (
                <>
                  {appliedTaxRates?.map((taxRate) => (
                    <TaxRateItem key={`tax-rate-item-${taxRate.id}`}>
                      <LeftSection>
                        <Avatar size="big" variant="connector">
                          <Icon size="medium" name="percentage" color="dark" />
                        </Avatar>
                        <div>
                          <Typography color="textSecondary" variant="bodyHl" noWrap>
                            {taxRate.name}
                          </Typography>
                          <Typography variant="caption" noWrap>
                            {taxRate.code}
                          </Typography>
                        </div>
                      </LeftSection>
                      <RightSection>
                        <Typography variant="body" color="grey700">
                          {intlFormatNumber((taxRate.rate || 0) / 100, {
                            minimumFractionDigits: 2,
                            style: 'percent',
                          })}
                        </Typography>
                        <Tooltip
                          placement="top-end"
                          title={translate('text_64639cfe2e46e9007d11b49d')}
                        >
                          <Button
                            icon="trash"
                            variant="quaternary"
                            onClick={() => {
                              deleteVATDialogRef.current?.openDialog(taxRate)
                            }}
                          />
                        </Tooltip>
                      </RightSection>
                    </TaxRateItem>
                  ))}
                  <TopMargedTypography variant="caption" color="grey600">
                    {translate('text_64639bf298650700512731a3')}
                  </TopMargedTypography>
                </>
              ) : (
                <Typography variant="caption" color="grey600">
                  {translate('text_64639bad55d65900f4dd896f')}
                </Typography>
              )}
            </Typography>
          </>
        )}
      </InfoBlock>

      <InlineSectionTitle>
        <Typography variant="subhead" color="grey700">
          {translate('text_638dc196fb209d551f3d8141')}
        </Typography>
        <Button
          variant="quaternary"
          endIcon={isPremium ? undefined : 'sparkles'}
          disabled={loading}
          onClick={
            isPremium
              ? editGracePeriodDialogRef?.current?.openDialog
              : premiumWarningDialogRef.current?.openDialog
          }
        >
          {translate('text_637f819eff19cd55a56d55e4')}
        </Button>
      </InlineSectionTitle>

      <InfoBlock $loading={loading}>
        {loading ? (
          <>
            <Skeleton variant="text" width={320} height={12} />
            <Skeleton variant="text" width={160} height={12} />
          </>
        ) : (
          <>
            <Typography variant="body" color="grey700">
              {translate(
                'text_638dc196fb209d551f3d81a2',
                { gracePeriod: invoiceGracePeriod },
                invoiceGracePeriod
              )}
            </Typography>
            <Typography variant="caption" color="grey600">
              {translate('text_638dc196fb209d551f3d81a6')}
            </Typography>
          </>
        )}
      </InfoBlock>

      <InlineSectionTitle>
        <Typography variant="subhead" color="grey700">
          {translate('text_63e51ef4985f0ebd75c212fd')}
        </Typography>
        <Button
          variant="quaternary"
          disabled={loading}
          onClick={editDocumentLanguageDialogRef?.current?.openDialog}
        >
          {translate('text_63e51ef4985f0ebd75c212fc')}
        </Button>
      </InlineSectionTitle>

      <InfoBlock $loading={loading}>
        {loading ? (
          <>
            <Skeleton variant="text" width={320} height={12} />
            <Skeleton variant="text" width={160} height={12} />
          </>
        ) : (
          <>
            <Typography variant="body" color="grey700">
              {DocumentLocales[documentLocale]}
            </Typography>
            <Typography variant="caption" color="grey600">
              {translate('text_63e51ef4985f0ebd75c212ff', {
                locale: DocumentLocales[documentLocale],
              })}
            </Typography>
          </>
        )}
      </InfoBlock>

      <InlineSectionTitle>
        <Typography variant="subhead" color="grey700">
          {translate('text_637f819eff19cd55a56d55f6')}
        </Typography>
        <Button
          variant="quaternary"
          disabled={loading}
          onClick={editInvoiceTemplateDialogRef?.current?.openDialog}
        >
          {translate('text_6380d7e60f081e5b777c4b24')}
        </Button>
      </InlineSectionTitle>

      <InfoBlock $loading={loading}>
        {loading ? (
          <>
            <Skeleton variant="text" width={320} height={12} />
            <Skeleton variant="text" width={160} height={12} />
          </>
        ) : !invoiceFooter ? (
          <>
            <Typography variant="body" color="grey700">
              {translate('text_637f819eff19cd55a56d55f8')}
            </Typography>
            <Typography variant="caption" color="grey600">
              {translate('text_637f819eff19cd55a56d55fa')}
            </Typography>
          </>
        ) : (
          <ShowMoreText
            variant="body"
            color="grey700"
            text={invoiceFooter}
            limit={MAX_FOOTER_LENGTH_DISPLAY_LIMIT}
          />
        )}
      </InfoBlock>

      <DeleteOrganizationVatRateDialog ref={deleteVATDialogRef} />
      <AddOrganizationVatRateDialog
        ref={editVATDialogRef}
        appliedTaxRatesTaxesIds={appliedTaxRates?.map((t) => t.id)}
      />
      <EditOrganizationInvoiceTemplateDialog
        ref={editInvoiceTemplateDialogRef}
        invoiceFooter={invoiceFooter}
      />
      <EditOrganizationGracePeriodDialog
        ref={editGracePeriodDialogRef}
        invoiceGracePeriod={invoiceGracePeriod}
      />
      <EditOrganizationDocumentLocaleDialog
        ref={editDocumentLanguageDialogRef}
        documentLocale={documentLocale}
      />
      <PremiumWarningDialog ref={premiumWarningDialogRef} />
    </Page>
  )
}

const Page = styled.div`
  max-width: ${theme.spacing(168)};
  padding: ${theme.spacing(8)} ${theme.spacing(12)};
`

const Title = styled(Typography)`
  margin-bottom: ${theme.spacing(2)};
`

const Subtitle = styled(Typography)`
  margin-bottom: ${theme.spacing(8)};
`

const InlineSectionTitle = styled.div`
  height: ${NAV_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InfoBlock = styled.div<{ $loading?: boolean }>`
  padding-top: ${({ $loading }) => ($loading ? theme.spacing(1) : 0)};
  padding-bottom: ${({ $loading }) => ($loading ? theme.spacing(9) : theme.spacing(8))};
  box-shadow: ${theme.shadows[7]};

  > *:not(:last-child) {
    margin-bottom: ${({ $loading }) => ($loading ? theme.spacing(4) : theme.spacing(1))};
  }
`

const TaxRateItem = styled.div`
  height: ${NAV_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${theme.shadows[7]};

  &:last-child {
    margin-bottom: ${theme.spacing(3)};
  }
`

const TopMargedTypography = styled(Typography)`
  margin-top: ${theme.spacing(3)};
`

const LeftSection = styled.div`
  display: flex;
  column-gap: ${theme.spacing(3)};
  align-items: center;
  flex: 1;
`

const RightSection = styled.div`
  display: flex;
  column-gap: ${theme.spacing(3)};
  align-items: center;
  flex: 1;
  justify-content: flex-end;
`

export default InvoiceSettings
