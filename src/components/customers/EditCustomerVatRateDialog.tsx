import { forwardRef, useState, useMemo } from 'react'
import { gql } from '@apollo/client'
import styled from 'styled-components'

import { CREATE_TAX_ROUTE } from '~/core/router'
import { Dialog, Button, DialogRef, Typography } from '~/components/designSystem'
import { ComboBox } from '~/components/form'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import {
  CustomerAppliedTaxRatesForSettingsFragmentDoc,
  EditCustomerVatRateFragment,
  useCreateCustomerAppliedTaxMutation,
  useGetTaxRatesForEditCustomerLazyQuery,
} from '~/generated/graphql'
import { theme } from '~/styles'
import { addToast } from '~/core/apolloClient'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'

import { Item } from '../form/ComboBox/ComboBoxItem'

gql`
  fragment EditCustomerVatRate on Customer {
    id
    name
    externalId
    taxes {
      id
      code
    }
  }

  query getTaxRatesForEditCustomer($limit: Int, $page: Int, $searchTerm: String) {
    taxes(limit: $limit, page: $page, searchTerm: $searchTerm) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        name
        rate
        code
      }
    }
  }

  mutation createCustomerAppliedTax($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      id
      ...CustomerAppliedTaxRatesForSettings
    }
  }

  ${CustomerAppliedTaxRatesForSettingsFragmentDoc}
`

export interface EditCustomerVatRateDialogRef extends DialogRef {}

interface EditCustomerVatRateDialogProps {
  customer: EditCustomerVatRateFragment
  appliedTaxRatesTaxesIds?: string[]
}

export const EditCustomerVatRateDialog = forwardRef<DialogRef, EditCustomerVatRateDialogProps>(
  ({ appliedTaxRatesTaxesIds, customer }: EditCustomerVatRateDialogProps, ref) => {
    const { translate } = useInternationalization()
    const [localTax, setLocalTax] = useState<string>('')
    const [getTaxRates, { loading, data }] = useGetTaxRatesForEditCustomerLazyQuery({
      variables: { limit: 20 },
    })
    const [createCustomerAppliedTax] = useCreateCustomerAppliedTaxMutation({
      onCompleted({ updateCustomer: mutationRes }) {
        if (mutationRes?.id) {
          addToast({
            message: translate('text_64639f5e63a5cc0076779de0'),
            severity: 'success',
          })
        }
      },
    })

    const comboboxTaxRatesData = useMemo(() => {
      if (!data || !data?.taxes || !data?.taxes?.collection) return []

      return data?.taxes?.collection.map((taxRate) => {
        const { id, name, rate, code } = taxRate

        return {
          label: `${name} - (${intlFormatNumber((rate || 0) / 100, {
            minimumFractionDigits: 2,
            style: 'percent',
          })})`,
          labelNode: (
            <Item>
              {name}&nbsp;
              <Typography color="textPrimary">
                (
                {intlFormatNumber((rate || 0) / 100, {
                  minimumFractionDigits: 2,
                  style: 'percent',
                })}
                )
              </Typography>
            </Item>
          ),
          value: code,
          disabled: appliedTaxRatesTaxesIds?.includes(id),
        }
      })
    }, [appliedTaxRatesTaxesIds, data])

    return (
      <Dialog
        ref={ref}
        title={translate('text_64639f5e63a5cc0076779d42', { name: customer.name })}
        description={translate('text_64639f5e63a5cc0076779d46')}
        onClickAway={() => {
          setLocalTax('')
        }}
        actions={({ closeDialog }) => (
          <>
            <Button
              variant="quaternary"
              onClick={() => {
                closeDialog()
                setLocalTax('')
              }}
            >
              {translate('text_627387d5053a1000c5287cab')}
            </Button>
            <Button
              variant="primary"
              disabled={!localTax}
              onClick={async () => {
                const res = await createCustomerAppliedTax({
                  variables: {
                    input: {
                      id: customer.id,
                      taxCodes: [...(customer?.taxes?.map((t) => t.code) || []), localTax],
                      // TODO: API should not require those fields on customer update
                      // To be tackled as improvement
                      externalId: customer.externalId,
                      name: customer.name || '',
                    },
                  },
                })

                if (res.errors) return
                setLocalTax('')
                closeDialog()
              }}
            >
              {translate('text_64639f5e63a5cc0076779d57')}
            </Button>
          </>
        )}
      >
        <Content data-test="edit-customer-vat-rate-dialog">
          <ComboBox
            allowAddValue
            addValueProps={{
              label: translate('text_64639c4d172d7a006ef30516'),
              redirectionUrl: CREATE_TAX_ROUTE,
            }}
            data={comboboxTaxRatesData}
            label={translate('text_64639c4d172d7a006ef30514')}
            loading={loading}
            onChange={setLocalTax}
            placeholder={translate('text_64639c4d172d7a006ef30515')}
            PopperProps={{ displayInDialog: true }}
            searchQuery={getTaxRates}
            value={localTax}
          />
        </Content>
      </Dialog>
    )
  }
)

const Content = styled.div`
  margin-bottom: ${theme.spacing(8)};
`

EditCustomerVatRateDialog.displayName = 'forwardRef'
