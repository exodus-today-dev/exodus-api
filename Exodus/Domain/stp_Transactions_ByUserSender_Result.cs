//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Exodus.Domain
{
    using System;
    
    public partial class stp_Transactions_ByUserSender_Result
    {
        public long TransactionID { get; set; }
        public decimal TransactionAmount { get; set; }
        public int CurrencyID { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencyName { get; set; }
        public long SenderUserID { get; set; }
        public string SenderUserFirstName { get; set; }
        public string SenderUserLastName { get; set; }
        public long ReceiverUserID { get; set; }
        public string ReceiverUserFirstName { get; set; }
        public string ReceiverUserLastName { get; set; }
        public Nullable<long> ObligationID { get; set; }
        public Nullable<long> ObligationKindID { get; set; }
        public string ObligationNameEng { get; set; }
        public string ObligationNameRus { get; set; }
        public string ObligationComment { get; set; }
        public bool isConfirmed { get; set; }
        public bool isConfirmedBySender { get; set; }
        public bool isConfirmedByReceiver { get; set; }
        public System.DateTime TransactionDateTime { get; set; }
        public string TransactionMemo { get; set; }
        public Nullable<long> AccountID { get; set; }
        public Nullable<int> AccountTypeID { get; set; }
        public string AccountTypeName { get; set; }
        public string AccountDetails { get; set; }
        public Nullable<long> BankID { get; set; }
        public string BankName { get; set; }
        public Nullable<long> CreditCardID { get; set; }
        public string CardNumber { get; set; }
        public int TransferTypeID { get; set; }
        public string TransferTypeNameEng { get; set; }
        public string TransferTypeNameRus { get; set; }
        public string TransferTypeComment { get; set; }
        public Nullable<long> TagID { get; set; }
        public string TagNameEng { get; set; }
        public string TagNameRus { get; set; }
        public Nullable<int> ApplicationID { get; set; }
        public string ApplicationNameEng { get; set; }
        public string ApplicationNameRus { get; set; }
    }
}
