import React from 'react'
import { Button } from './ui/button'

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
    return (
        <>
            {variant === "primary" ? (
                <Button>
                    Conect Bank
                </Button>
            ) : variant === "ghost" ? (
                <Button>
                    Conect Bank
                </Button>
            ) :
                (
                    <Button>
                        Connect Bank
                    </Button>
                )
            }
        </>
    )
}

export default PlaidLink