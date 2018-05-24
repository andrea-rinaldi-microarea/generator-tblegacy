
#include "stdafx.h"

#include "D<%= documentName %>.h"  
#include <<%= moduleName %>\<%= dblName %>\<%= tableName %>.h>


#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
static TCHAR szParamID[] = _T("paramID");

//////////////////////////////////////////////////////////////////////////////
//             class DBT<%= documentName %> implementation
//////////////////////////////////////////////////////////////////////////////
//
//----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC (DBT<%= documentName %>, DBTMaster)

//-----------------------------------------------------------------------------	
DBT<%= documentName %>::DBT<%= documentName %>
	(
		CRuntimeClass*		pClass, 
		CAbstractFormDoc*	pDocument
	)
	:
	DBTMaster (pClass, pDocument, _NS_DBT("<%= documentName %>"))
{
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnEnableControlsForFind ()
{
	Get<%= tableBaseName %> ()->f_DocNo.SetFindable();
	Get<%= tableBaseName %> ()->f_DocDate.SetFindable();
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnDisableControlsForEdit ()
{
}

//-----------------------------------------------------------------------------	
void DBT<%= documentName %>::OnPrepareBrowser (SqlTable* pTable)
{
	<%= tableName %>* pRec = (<%= tableName %>*) pTable->GetRecord();

	pTable->SelectAll();
	pTable->AddSortColumn(pRec->f_DocDate);
	pTable->AddSortColumn(pRec->f_DocNo);
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnDefineQuery ()
{
	m_pTable->SelectAll			();
	m_pTable->AddParam			(szParamID, Get<%= tableBaseName %>()->f_DocID);
	m_pTable->AddFilterColumn	(Get<%= tableBaseName %>()->f_DocID);
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>::OnPrepareQuery ()
{
	m_pTable->SetParamValue (szParamID, Get<%= tableBaseName %>()->f_DocID);
}

//-----------------------------------------------------------------------------
BOOL DBT<%= documentName %>::OnCheckPrimaryKey	()
{
	return TRUE;
}

//////////////////////////////////////////////////////////////////////////////
//             class DBT<%= documentName %>Details implementation
//////////////////////////////////////////////////////////////////////////////
//
//----------------------------------------------------------------------------
IMPLEMENT_DYNAMIC (DBT<%= documentName %>Details, DBTSlaveBuffered)

//-----------------------------------------------------------------------------	
DBT<%= documentName %>Details::DBT<%= documentName %>Details
	(
		CRuntimeClass*		pClass, 
		CAbstractFormDoc*	pDocument
	)
	:
	DBTSlaveBuffered (pClass, pDocument, _NS_DBT("<%= documentName %>Details"), ALLOW_EMPTY_BODY, FALSE)
{
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>Details::OnDefineQuery ()
{
	m_pTable->SelectAll			();
	m_pTable->AddParam			(szParamID,Get<%= tableBaseName %>()->f_DocID);
	m_pTable->AddFilterColumn	(Get<%= tableBaseName %> ()->f_DocID);
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>Details::OnPrepareQuery ()
{
	m_pTable->SetParamValue(szParamID, Get<%= tableBaseName %>()->f_DocID); 
}

//-----------------------------------------------------------------------------
void DBT<%= documentName %>Details::OnPreparePrimaryKey (int nRow, SqlRecord* pRec)
{
	m_pTable->SetParamValue (szParamID, Get<%= tableBaseName %>()->f_DocID);

	ASSERT (pRec->IsKindOf(RUNTIME_CLASS(<%= tableName %>Details)));
	
	<%= tableName %>Details* pDetail= (<%= tableName %>Details*) pRec;
  
	pDetail->f_DocID	= Get<%= tableBaseName %>()->f_DocID;  
	pDetail->f_DocSubID	= Get<%= tableBaseName %>()->f_LastSubId;
	Get<%= tableBaseName %>()->f_LastSubId += 1;
}

//-----------------------------------------------------------------------------
BOOL DBT<%= documentName %>Details::OnCheckPrimaryKey	()
{
	return NULL;
}

//////////////////////////////////////////////////////////////////////////////
//									D<%= documentName %>                          //
//////////////////////////////////////////////////////////////////////////////
//
//-----------------------------------------------------------------------------
IMPLEMENT_DYNCREATE(D<%= documentName %>, CAbstractFormDoc)

//-----------------------------------------------------------------------------
D<%= documentName %>::D<%= documentName %>()
	:
	m_pDBT<%= documentName %>	(NULL),
	m_pDBTDetail				(NULL)
{
}

//-----------------------------------------------------------------------------
<%= tableName %>*			D<%= documentName %>::Get<%= tableBaseName %>	()		 	const {return m_pDBT<%= documentName %>->Get<%= tableBaseName %>(); }
<%= tableName %>Details*	D<%= documentName %>::GetDetail					(int nRow)  const {return m_pDBTDetail->GetDetail(nRow); }

//-----------------------------------------------------------------------------
BOOL D<%= documentName %>::OnAttachData()
{              
	SetFormTitle (_TB("<%= documentTitle %>"));
	
	m_pDBT<%= documentName %>	= new DBT<%= documentName %> 		(RUNTIME_CLASS (<%= tableName %>), this);
	m_pDBTDetail				= new DBT<%= documentName %>Details	(RUNTIME_CLASS (<%= tableName %>Details), this);
	
	m_pDBT<%= documentName %>->Attach(m_pDBTDetail);

	return Attach (m_pDBT<%= documentName %>);
}