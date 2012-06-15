<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class CollectionsController extends Controller
{
    public function indexAction()
    {
	    $request = $this->getRequest();
	    $locale=$this->get('session')->getLocale();
        return $this->redirect(sprintf('%s#%s', $this->generateUrl('search',array('_locale'=>$locale)), 'view_type=list&content=collection&'));
    }
}
