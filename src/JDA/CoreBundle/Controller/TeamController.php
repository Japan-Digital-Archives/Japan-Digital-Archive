<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class TeamController extends Controller
{
    
    public function indexAction()
    {
    
    	$locale=$this->getRequest()->getLocale();

        //If search query posted, redirect to search page and pass search query as url hash
        $user = $this->get('security.context')->getToken()->getUser();
        
        if(is_object($user)){
            $displayName = $user->getDisplayName();
            $userId = $user->getId();
        }
        else{
            $displayName='none';
            $userId=0;  
        }
    	
    	//If search query posted, redirect to search page and pass search query as url hash
    	
    	$request = $this->getRequest();
    	if($request->request->get('search-text')) return $this->redirect(sprintf('%s#%s', $this->generateUrl('search',array('_locale'=>$locale)), 'text='.$request->request->get('search-text')));
   
        return $this->render('JDACoreBundle:Team:team.html.twig', array(
					// last displayname entered by the user
					'page'=> 'team',
					'displayname'=>$displayName,
                    'userId'=>$userId,
				));
    	
    
    }
}
