import { HeaderContainer, HeaderContent, Logo, NewTransactionButton } from "./styles";

import imagemcurso from '../../assets/imagemcurso.svg'
import * as Dialog  from "@radix-ui/react-dialog";
import { NewTransactionModal } from "../NewTransactionModal";

export function Header() {
    return (
        <HeaderContainer>
            <HeaderContent>
                <Logo>
                    <img src={imagemcurso} alt="" />
                    <strong>DT Money</strong>
                </Logo>

                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <NewTransactionButton>Nova transação</NewTransactionButton>
                    </Dialog.Trigger>
                    <NewTransactionModal />
                </Dialog.Root>
            </HeaderContent>
        </HeaderContainer>
    )
}