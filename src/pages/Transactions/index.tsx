import { Header } from "../../components/Header";
import { Summary } from "../../components/Summary";
import { SearchForm } from "./components/SearchForm";
import { PriceHighLight, TransactionContainer, TransactionTable } from "./styles";

export function Transactions() {
    return (
        <div>
            <Header />
            <Summary />

            <TransactionContainer>
                <SearchForm />
                <TransactionTable>
                <tbody>
                    <tr>
                        <td width="50%">Desenvolvimento de site</td>
                        <td>
                            <PriceHighLight variant="income">
                                R$ 12.000,00
                            </PriceHighLight>
                        </td>
                        <td>Venda</td>
                        <td>01/04/2026</td>
                    </tr>
                    <tr>
                        <td width="50%">Mecanico</td>
                        <td>
                            <PriceHighLight variant="outcome">
                                - R$ 6.000,00
                            </PriceHighLight>
                        </td>
                        <td>Carro</td>
                        <td>01/04/2026</td>
                    </tr>
                    <tr>
                        <td width="50%">Comida</td>
                        <td>
                            <PriceHighLight variant="income">
                                - R$ 100,00
                            </PriceHighLight>
                        </td>
                        <td>Alimentacao</td>
                        <td>01/04/2026</td>
                    </tr>
                </tbody>
            </TransactionTable>
            </TransactionContainer>
        </div>
    )
}